import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderAlertStatus } from '../../common/enums/order-alert-status.enum';
import { OrderAlertType } from '../../common/enums/order-alert-type.enum';
import { User } from '../../users/entities/user.entity';
import { Order } from './order.entity';

@Entity('order_alerts')
export class OrderAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: OrderAlertType })
  type: OrderAlertType;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'enum', enum: OrderAlertStatus, default: OrderAlertStatus.OPEN })
  status: OrderAlertStatus;

  @Column({ type: 'text', nullable: true })
  staffNote?: string;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
