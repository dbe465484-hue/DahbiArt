import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../common/enums/user-role.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  async onApplicationBootstrap() {
    try {
      const email = this.config.get<string>('ADMIN_EMAIL', 'admin@admin.com');
      const password = this.config.get<string>('ADMIN_PASSWORD', 'Admin123@');
      if (!email || !password) return;

      const normalized = email.toLowerCase();
      const hash = await bcrypt.hash(password, 12);
      const existing = await this.users.findByEmail(normalized, true);

      if (existing) {
        await this.users.updatePassword(existing.id, hash);
        if (existing.role !== UserRole.ADMIN) {
          await this.users.setRole(existing.id, UserRole.ADMIN);
        }
        this.logger.log(`Compte admin synchronisé : ${normalized}`);
        return;
      }

      await this.users.create({
        email: normalized,
        password: hash,
        firstName: 'Admin',
        lastName: 'Mayn',
        role: UserRole.ADMIN,
        country: 'MA',
      });
      this.logger.log(`Compte admin créé : ${normalized}`);
    } catch (err) {
      this.logger.warn(
        `Seed admin ignoré : ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}
