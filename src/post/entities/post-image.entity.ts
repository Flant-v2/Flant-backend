import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

@Entity('post_images')
export class PostImage {
  @PrimaryGeneratedColumn({ unsigned: true })
  postImageId: number;

  @Column({ unsigned: true })
  postId: number;
  
  /**
  * 게시글에 등록할 이미지 URL
  * @example 'https://www.kasi.re.kr/file/content/20190408102300583_PFFSRTDT.jpg'
  */
  @ApiPropertyOptional({
  example: 'https://www.kasi.re.kr/file/content/20190408102300583_PFFSRTDT.jpg',
  })
  @IsOptional()
  @Column()
  postImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Post, (post) => post.postImages, { onDelete: 'CASCADE' })
  @JoinColumn({name: 'post_id'})
  post: Post;
}
