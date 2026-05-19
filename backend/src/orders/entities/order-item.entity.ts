import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItemType } from '../../common/enums/order-item-type.enum';
import { Painting } from '../../paintings/entities/painting.entity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  paintingId: string;

  @ManyToOne(() => Painting, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'paintingId' })
  painting: Painting;

  @Column({ length: 180 })
  paintingSlug: string;

  @Column({ length: 255 })
  paintingTitle: string;

  @Column({ type: 'enum', enum: OrderItemType })
  type: OrderItemType;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lineTotal: number;
}
