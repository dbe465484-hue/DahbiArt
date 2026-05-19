import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PaintingsService } from './paintings.service';
import { CreatePaintingDto } from './dto/create-painting.dto';

type SeedItem = Omit<CreatePaintingDto, 'slug'> & { slug: string };

export type CatalogSyncResult = {
  created: number;
  updated: number;
  removed: number;
  already: number;
  total: number;
  errors: string[];
};

@Injectable()
export class PaintingsSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PaintingsSeedService.name);

  constructor(private readonly paintings: PaintingsService) {}

  private seedFilePath() {
    return path.join(__dirname, '../data/paintings-seed.json');
  }

  private loadSeedItems(): SeedItem[] {
    const file = this.seedFilePath();
    if (!fs.existsSync(file)) {
      throw new Error(`Fichier seed absent : ${file}`);
    }
    const { paintings } = JSON.parse(fs.readFileSync(file, 'utf8')) as {
      paintings: SeedItem[];
    };
    return paintings;
  }

  async syncCatalog(options?: { removeOrphans?: boolean }): Promise<CatalogSyncResult> {
    const paintings = this.loadSeedItems();
    let created = 0;
    let updated = 0;
    let already = 0;
    const errors: string[] = [];

    for (const item of paintings) {
      const exists = await this.paintings.existsBySlug(item.slug);
      try {
        await this.paintings.upsertFromSeed({ ...item, slug: item.slug });
        if (exists) updated++;
        else created++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${item.slug}: ${msg}`);
        this.logger.warn(`Seed ignoré (${item.slug}): ${msg}`);
      }
    }

    let removed = 0;
    const shouldRemoveOrphans =
      options?.removeOrphans === true ||
      process.env.SEED_REMOVE_ORPHANS === 'true';

    if (shouldRemoveOrphans) {
      try {
        removed = await this.paintings.removeOrphans(
          paintings.map((p) => p.slug),
        );
        if (removed > 0) {
          this.logger.log(
            `${removed} ancienne(s) fiche(s) retirée(s) (hors catalogue seed)`,
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`orphans: ${msg}`);
      }
    }

    already = Math.max(0, paintings.length - created - updated);

    return {
      created,
      updated,
      removed,
      already,
      total: paintings.length,
      errors,
    };
  }

  async onApplicationBootstrap() {
    try {
      const result = await this.syncCatalog({ removeOrphans: false });
      if (result.created > 0 || result.updated > 0 || result.removed > 0) {
        this.logger.log(
          `Catalogue : ${result.created} créé(s), ${result.updated} mis à jour, ${result.removed} retiré(s) (${result.total} œuvres)`,
        );
      } else if (result.already === result.total) {
        this.logger.log(
          `${result.total} tableau(x) — catalogue à jour`,
        );
      }
    } catch (err) {
      this.logger.warn(err instanceof Error ? err.message : String(err));
    }
  }
}
