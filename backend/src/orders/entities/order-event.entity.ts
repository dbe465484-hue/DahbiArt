import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_events')
export class OrderEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ length: 40 })
  type: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  actorUserId?: string;

  @Column({ nullable: true, length: 120 })
  actorName?: string;

  @CreateDateColumn()
  createdAt: Date;
}
