import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/user-role.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export type SafeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country: string;
  role: UserRole;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly appNotifications: NotificationsService,
  ) {}

  private sanitize(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country: string;
    role: UserRole;
  }): SafeUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      postalCode: user.postalCode,
      city: user.city,
      country: user.country,
      role: user.role,
    };
  }

  private signToken(user: SafeUser) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email,
      password: passwordHash,
      phone: dto.phone?.trim(),
      role: UserRole.CUSTOMER,
    });

    await this.appNotifications.notifyUserRegistered(user);

    const safe = this.sanitize(user);
    return { user: safe, accessToken: this.signToken(safe) };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(
      dto.email.toLowerCase().trim(),
      true,
    );
    if (!user?.password) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const safe = this.sanitize(user);
    return { user: safe, accessToken: this.signToken(safe) };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Session invalide');
    }
    return this.sanitize(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Session invalide');
    }

    const patch: Partial<typeof user> = {};

    if (dto.firstName !== undefined) patch.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) patch.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) patch.phone = dto.phone.trim() || undefined;
    if (dto.address !== undefined) patch.address = dto.address.trim() || undefined;
    if (dto.postalCode !== undefined) {
      patch.postalCode = dto.postalCode.trim() || undefined;
    }
    if (dto.city !== undefined) patch.city = dto.city.trim() || undefined;
    if (dto.country !== undefined) patch.country = dto.country.trim().toUpperCase();

    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase().trim();
      if (email !== user.email) {
        const existing = await this.usersService.findByEmail(email);
        if (existing && existing.id !== userId) {
          throw new ConflictException('Cet email est déjà utilisé');
        }
        patch.email = email;
      }
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Le mot de passe actuel est requis');
      }
      const withPassword = await this.usersService.findByEmail(user.email, true);
      if (!withPassword?.password) {
        throw new UnauthorizedException('Session invalide');
      }
      const valid = await bcrypt.compare(dto.currentPassword, withPassword.password);
      if (!valid) {
        throw new UnauthorizedException('Mot de passe actuel incorrect');
      }
      patch.password = await bcrypt.hash(dto.newPassword, 12);
    }

    const updated = await this.usersService.update(userId, patch);
    return this.sanitize(updated);
  }
}
