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
import { ReportTypes } from '../types/report.types';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';

export class Report {
  @PrimaryGeneratedColumn({ unsigned: true })
  reportId: number;

  @Column({ unsigned: true })
  communityUserId: number;

  @Column({ unsigned: true })
  postId: number;

  @Column({ unsigned: true, nullable: true })
  commentId?: number;

  @Column({ type: 'enum', enum: ReportTypes, default: 'DisallowedActivities' })
  type: ReportTypes;

  @Column({ unsigned: true })
  content: string;

  @Column({ unsigned: true, default: 'true' })
  isValidReport: boolean;

  @CreateDateColumn()
  createdAt: Date;

  //커뮤니티 유저연결
  @ManyToOne(() => CommunityUser, (communityUser) => communityUser.report, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  communityUser: CommunityUser;

  //댓글 연결
  @OneToOne(() => Comment, (comment) => comment.report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  comment: Comment;

  //포스터 연결
  @OneToOne(() => Post, (post) => post.report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  post: Post;
}
