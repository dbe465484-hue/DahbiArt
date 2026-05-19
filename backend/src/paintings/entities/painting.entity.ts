import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaintingStatus } from '../../common/enums/painting-status.enum';

@Entity('paintings')
export class Painting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 180 })
  slug: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ length: 40 })
  dimensions: string;

  @Column({ length: 120 })
  medium: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'enum', enum: PaintingStatus, default: PaintingStatus.AVAILABLE })
  status: PaintingStatus;

  @Column({ default: false })
  printAvailable: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  printPrice?: number;

  @Column({ length: 1000 })
  image: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 60 })
  subject: string;

  @Column({ length: 60 })
  location: string;

  @Column({ length: 80 })
  collection: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: false })
  bestSeller: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
