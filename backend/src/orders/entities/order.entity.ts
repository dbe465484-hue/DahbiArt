import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { User } from '../../users/entities/user.entity';
import { OrderEvent } from './order-event.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 32 })
  reference: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ length: 100 })
  customerFirstName: string;

  @Column({ length: 100 })
  customerLastName: string;

  @Column({ length: 255 })
  customerEmail: string;

  @Column({ nullable: true, length: 30 })
  customerPhone?: string;

  @Column({ nullable: true, length: 500 })
  shippingAddress?: string;

  @Column({ nullable: true, length: 20 })
  shippingPostalCode?: string;

  @Column({ nullable: true, length: 100 })
  shippingCity?: string;

  @Column({ length: 2, default: 'MA' })
  shippingCountry: string;

  @Column({ nullable: true, length: 255 })
  stripeSessionId?: string;

  @Column({ nullable: true, length: 255 })
  stripePaymentIntentId?: string;

  @Column({ type: 'datetime', nullable: true })
  paidAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  shippedAt?: Date;

  @Column({ nullable: true, length: 80 })
  shippingCarrier?: string;

  @Column({ nullable: true, length: 120 })
  shippingTrackingNumber?: string;

  @Column({ type: 'text', nullable: true })
  internalNote?: string;

  @Column({ type: 'datetime', nullable: true })
  refundedAt?: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderEvent, (event) => event.order, { cascade: true })
  events: OrderEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
