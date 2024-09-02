import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProgressTypes } from '../types/progress.types';
import { Cart } from '../../cart/entities/cart.entity';
import { User } from 'src/user/entities/user.entity';
import { OrderItem } from './orderItem.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({unsigned: true})
  userId: number;

  @IsNumber()
  @Column()
  totalPrice: number;

  @Column({ type: 'enum', enum: ProgressTypes, default: 'ready' })
  progress: ProgressTypes;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //유저연결
  @ManyToOne(() => User, (user) => user.order, { onDelete: 'CASCADE' })
  @JoinColumn({name: 'user_id'})
  user: User;

  //카트연결
  @OneToOne(() => Cart, (cart) => cart.order)
  cart: Cart;

  //orderItem 연결
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItem: OrderItem[];
}
