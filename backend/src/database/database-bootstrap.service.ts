import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Migrations SQL légères au démarrage (sans TypeORM synchronize en prod).
 * Ajoute soft-delete et élargit image si besoin, sans imposer NOT NULL sur des lignes existantes.
 */
@Injectable()
export class DatabaseBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseBootstrapService.name);
  private _ready: Promise<void> = Promise.resolve();

  constructor(private readonly dataSource: DataSource) {}

  get ready(): Promise<void> {
    return this._ready;
  }

  async onModuleInit() {
    this._ready = this.runMigrations();
    await this._ready;
  }

  private async runMigrations() {
    if (this.dataSource.options.type !== 'postgres') return;

    const tables = ['paintings', 'blog_posts', 'events'] as const;
    for (const table of tables) {
      try {
        await this.dataSource.query(
          `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP`,
        );
      } catch (err) {
        this.logger.warn(
          `Migration ${table}.deletedAt : ${err instanceof Error ? err.message : err}`,
        );
      }
    }

    for (const table of ['paintings', 'blog_posts'] as const) {
      try {
        await this.dataSource.query(
          `UPDATE "${table}" SET image = '' WHERE image IS NULL`,
        );
        await this.dataSource.query(
          `ALTER TABLE "${table}" ALTER COLUMN image TYPE varchar(2048)`,
        );
      } catch (err) {
        this.logger.warn(
          `Migration ${table}.image : ${err instanceof Error ? err.message : err}`,
        );
      }
    }

    this.logger.log('Migrations Postgres (soft-delete, image) terminées');
  }
}
