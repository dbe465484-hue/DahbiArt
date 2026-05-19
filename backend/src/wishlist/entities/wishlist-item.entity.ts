import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Painting } from '../../paintings/entities/painting.entity';
import { User } from '../../users/entities/user.entity';

@Entity('wishlist_items')
@Unique(['userId', 'paintingId'])
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Index()
  @Column({ type: 'uuid' })
  paintingId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Painting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paintingId' })
  painting: Painting;

  @CreateDateColumn()
  createdAt: Date;
}
