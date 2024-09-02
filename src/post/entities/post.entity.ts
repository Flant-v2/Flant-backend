import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostImage } from './post-image.entity';
import { Community } from 'src/community/entities/community.entity';
import { Exclude } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Artist } from './../../admin/entities/artist.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn({ unsigned: true })
  postId: number;

  @Column({ unsigned: true })
  communityUserId: number;

  @Column({ unsigned: true })
  communityId: number;

  /**
   * 작성자가 artist일때 자동 기입
   */
  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Column({ unsigned: true, nullable: true })
  artistId: number | null;

  /**
   * 게시글 내용
   * @example '13:00 음악방송, 15:00 개인방송'
   */
  @IsNotEmpty()
  @IsString()
  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => PostImage, (postImage) => postImage.post)
  @Exclude()
  postImages: PostImage[];

  @ManyToOne(() => Community, (community) => community.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @ManyToOne(() => Artist, (artist) => artist.posts)
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @ManyToOne(() => CommunityUser, (communityUser) => communityUser.posts,{
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'community_user_id'})
  communityUser: CommunityUser;
}
