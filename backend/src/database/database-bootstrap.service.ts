import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

/** Ajoute les colonnes soft-delete si la base n’a pas encore été migrée. */
@Injectable()
export class DatabaseBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseBootstrapService.name);
  private _ready: Promise<void> = Promise.resolve();

  constructor(private readonly dataSource: DataSource) {}

  get ready(): Promise<void> {
    return this._ready;
  }

  async onModuleInit() {
    this._ready = this.ensureSoftDeleteColumns();
    await this._ready;
  }

  private async ensureSoftDeleteColumns() {
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
    this.logger.log('Colonnes soft-delete (deletedAt) vérifiées');
  }
}
