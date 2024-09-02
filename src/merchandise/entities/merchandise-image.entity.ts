import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Merchandise } from './merchandise.entity';

@Entity('merchandise_image')
export class MerchandiseImage {
  @PrimaryGeneratedColumn({ unsigned: true })
  merchandiseImageId: number;

  @Column({ unsigned: true })
  merchandiseId: number;

  @Column()
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 상품게시물 연결
  @ManyToOne(
    () => Merchandise,
    (merchandise) => merchandise.merchandiseImage,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'merchandise_id' })
  merchandisePost: Merchandise;
}
