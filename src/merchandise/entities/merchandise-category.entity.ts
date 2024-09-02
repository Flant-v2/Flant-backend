import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';
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
import { Community } from 'src/community/entities/community.entity';
import { Merchandise } from './merchandise.entity';

@Entity('merchandise_category')
export class MerchandiseCategory {
  @PrimaryGeneratedColumn({ unsigned: true })
  merchandiseCategoryId: number;

  /**
   * 커뮤니티 ID
   * @example 1
   */ 
  @IsNumber()
  @IsNotEmpty()
  @Column({ unsigned: true })
  communityId: number;

  /**
   * 카테고리 이름
   * @example "Season Greeting"
   */ 
  @IsNotEmpty({ message: '카테고리 이름을 입력해주세요' })
  @IsString()
  @Column()
  categoryName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 커뮤니티와 연결
  @ManyToOne(() => Community, (community) => community.merchandise)
  @JoinColumn({ name: 'community_id' })
  community: Community;

  // 상품과 연결
  @OneToMany(
    () => Merchandise,
    (merchandise) => merchandise.merchandiseCategory,
    { onDelete: 'CASCADE' },
  )
  merchandise: Merchandise[];
}
