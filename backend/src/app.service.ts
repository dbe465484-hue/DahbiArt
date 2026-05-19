import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHello(): { message: string; project: string } {
    return {
      message: 'Bienvenue sur l’API Mayn',
      project: 'Galerie — vente de tableaux',
    };
  }

  async getHealth(): Promise<{ status: string; database: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', database: 'connected' };
    } catch {
      return { status: 'ok', database: 'disconnected' };
    }
  }
}
