import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CommunityUser } from '../../community/community-user/entities/communityUser.entity';
import { Artist } from '../../admin/entities/artist.entity';
import { join } from 'path';
//import { Post } from 'src/post/entities/post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn({ unsigned: true })
  commentId: number;

  @Column({ unsigned: true })
  postId: number;

  // @ManyToOne(() => Post, (post) => post.comments)
  // post: Post;

  @Column({ unsigned: true })
  communityUserId: number;
  @ManyToOne(() => CommunityUser, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'community_user_id' })
  communityUser: CommunityUser;

  @Column({ unsigned: true, nullable: true })
  artistId: number | null;

  @ManyToOne(() => Artist, (artist) => artist.comments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({name: 'artist_id'})
  artist: Artist | null;

  @Column('text')
  comment: string;

  @Column({ nullable: true })
  imageUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: Comment | null;
}
