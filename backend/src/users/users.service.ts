import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string, withPassword = false) {
    return this.usersRepo.findOne({
      where: { email: email.toLowerCase() },
      select: withPassword
        ? [
            'id',
            'email',
            'password',
            'firstName',
            'lastName',
            'phone',
            'address',
            'postalCode',
            'city',
            'country',
            'role',
            'createdAt',
          ]
        : undefined,
    });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findIdsByRoles(roles: UserRole[]) {
    if (roles.length === 0) return [];
    const users = await this.usersRepo.find({
      where: { role: In(roles) },
      select: ['id'],
    });
    return users.map((u) => u.id);
  }

  create(data: Partial<User>) {
    const user = this.usersRepo.create({
      ...data,
      email: data.email!.toLowerCase(),
    });
    return this.usersRepo.save(user);
  }

  countCustomers() {
    return this.usersRepo.count({ where: { role: UserRole.CUSTOMER } });
  }

  findAll() {
    return this.usersRepo.find({
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phone',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  findAdminByEmail(email: string) {
    return this.usersRepo.findOne({
      where: { email: email.toLowerCase(), role: UserRole.ADMIN },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role'],
    });
  }

  async updatePassword(id: string, passwordHash: string) {
    await this.usersRepo.update(id, { password: passwordHash });
  }

  async setRole(id: string, role: UserRole) {
    await this.usersRepo.update(id, { role });
  }

  async update(id: string, data: Partial<User>) {
    await this.usersRepo.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Utilisateur introuvable après mise à jour');
    }
    return updated;
  }

  async remove(id: string) {
    const user = await this.findById(id);
    if (!user) return false;
    await this.usersRepo.delete(id);
    return true;
  }
}
