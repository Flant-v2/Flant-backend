import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartItem } from './cart.item.entity';
import { Order } from '../../order/entities/order.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('carts')
export class Cart {
  map(cart: Cart) {
    throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  // 카트아이템 연결
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    onDelete: 'CASCADE',
  })
  cartItem: CartItem[];

  //주문 연결
  @OneToOne(() => Order, (order) => order.cart)
  order: Order;

  //유저연결
  @OneToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
