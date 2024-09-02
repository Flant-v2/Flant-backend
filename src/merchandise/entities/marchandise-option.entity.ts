import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
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
import { Merchandise } from './merchandise.entity';
import { CartItem } from 'src/cart/entities/cart.item.entity';

@Entity('merchandise_option')
export class MerchandiseOption {
  // forEach(arg0: (option: any) => void) {
  //   throw new Error('Method not implemented.');
  // }
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  merchandiseId: number;

  @Column()
  optionName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //상품 연결
  @ManyToOne(
    () => Merchandise,
    (merchandise) => merchandise.merchandiseOption,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'merchandise_id' })
  merchandise: Merchandise;

  // 주문 연결
  @OneToMany(() => CartItem, (cartItem) => cartItem.merchandiseOption, {
    onDelete: 'CASCADE',
  })
  cartItem: CartItem[];
}
