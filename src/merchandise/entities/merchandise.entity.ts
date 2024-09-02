import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';
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
import { MerchandiseOption } from './marchandise-option.entity';
import { MerchandiseImage } from './merchandise-image.entity';
import { CartItem } from 'src/cart/entities/cart.item.entity';
import { Community } from 'src/community/entities/community.entity';
import { MerchandiseCategory } from './merchandise-category.entity';

@Entity('merchandise')
export class Merchandise {
  @PrimaryGeneratedColumn({ unsigned: true })
  merchandiseId: number;

  /**
   * 커뮤니티 id
   * @example 1
   */
  @IsNotEmpty({ message: '커뮤니티 id를 입력해주세요' })
  @IsNumber()
  @Column({ unsigned: true })
  communityId: number;

  /**
   * 카테고리 id
   * @example 1
   */
  @IsNotEmpty({ message: '카테고리 id를 입력해주세요' })
  @IsNumber()
  @Column({ unsigned: true })
  @Column({ unsigned: true })
  merchandiseCategoryId: number;

  /**
   * 상품 이름
   * @example "상품 이름"
   */
  @IsNotEmpty({ message: '상품 이름을 입력해주세요' })
  @IsString()
  @Column()
  merchandiseName: string;

  /**
   * 상품 썸네일
   * @example "thunbnail.jpg"
   */
  @IsNotEmpty({ message: '상품 썸네일 URL을 입력해주세요' })
  @IsUrl()
  @Column()
  thumbnail: string;

  /**
   * 내용
   * @example "상품 내용"
   */
  @IsNotEmpty({ message: '내용을 입력해주세요' })
  @IsString()
  @Column()
  content: string;

  /**
   * 가격
   * @example 10000
   */
  @IsNotEmpty({ message: '가격을 입력해주세요' })
  @IsNumber()
  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 커뮤니티와 연결
  @ManyToOne(() => Community, (community) => community.merchandise)
  @JoinColumn({ name: 'community_id' })
  community: Community;

  // 카테고리와 연결
  @ManyToOne(() => MerchandiseCategory, (merchandiseCategory) => merchandiseCategory.merchandise)
  @JoinColumn({ name: 'merchandise_category_id' })
  merchandiseCategory: MerchandiseCategory;

  // 상품 이미지 연결
  @OneToMany(
    () => MerchandiseImage,
    (merchandiseImage) => merchandiseImage.merchandisePost,
    { onDelete: 'CASCADE' },
  )
  merchandiseImage: MerchandiseImage[];

  // 옵션 연결
  @OneToMany(
    () => MerchandiseOption,
    (merchandiseOption) => merchandiseOption.merchandise,
    { onDelete: 'CASCADE' },
  )
  merchandiseOption: MerchandiseOption[];

  // 주문 연결
  @OneToMany(() => CartItem, (cartItem) => cartItem.merchandise, {
    onDelete: 'CASCADE',
  })
  cartItems: CartItem[];
}
