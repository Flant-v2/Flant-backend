import { IsNumber } from 'class-validator';

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({unsigned: true})
  orderId: number;

  @IsNumber()
  @Column({ unsigned: true })
  merchandisePostId: number;

  @IsNumber()
  @Column()
  merchandiseOption: number;

  @IsNumber()
  @Column()
  merchandiseOptionPrice: number;

  @IsNumber()
  @Column()
  quantity: number;

  @ManyToOne(() => Order, (order) => order.orderItem, { onDelete: 'CASCADE' })
  @JoinColumn({name: 'order_id'})
  order: Order;
}
