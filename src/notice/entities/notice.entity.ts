import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NoticeImage } from './notice-image.entity';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity('notices')
export class Notice {
  @PrimaryGeneratedColumn({ unsigned: true })
  noticeId: number;

  @Column({ unsigned: true })
  communityId: number;

  @Column({ unsigned: true })
  managerId: number;

  /**
   * 공지 제목
   * @example '별하늘인간이 드리는 안내 말씀'
   */
  @Column()
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * 공지 내용
   * @example '별하늘인간 커뮤니티가 개설되었습니다. 환영합니다.'
   */
  @Column()
  @IsString()
  @IsNotEmpty()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => NoticeImage, (noticeImage) => noticeImage.notice)
  noticeImages: NoticeImage[];
}
