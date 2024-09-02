import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { Membership } from '../../../membership/entities/membership.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Community } from '../../entities/community.entity';
import { User } from '../../../user/entities/user.entity';
import { Comment } from '../../../comment/entities/comment.entity';
import { Artist } from 'src/admin/entities/artist.entity';
import { Manager } from './../../../admin/entities/manager.entity';
import { Post } from 'src/post/entities/post.entity';
import { IsValidNameConstraint } from 'src/util/decorators/is-valid-name-constraint';

@Entity('community_users')
export class CommunityUser {
  @PrimaryGeneratedColumn({ unsigned: true })
  communityUserId: number;

  @Column({ unsigned: true })
  userId: number;

  @Column({ unsigned: true })
  communityId: number;

  /**
   * 커뮤니티에서 사용할 닉네임
   * @example '별하늘인간 팬'
   */
  @IsString()
  @IsNotEmpty({ message: '커뮤니티에서 사용할 닉네임을 입력해주세요.' })
  @Validate(IsValidNameConstraint)
  @Column()
  nickName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Community, (community) => community.communityUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @ManyToOne(() => User, (user) => user.communityUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  users: User;

  @OneToMany(() => Membership, (membership) => membership.communityUser, {
    cascade: true,
  })
  membership: Membership[];

  @OneToMany(() => Comment, (comment) => comment.communityUser)
  comments: Comment[]; // 커뮤니티와 댓글 관계

  @OneToOne(() => Artist, (artist) => artist.communityUser)
  artist: Artist;

  @OneToOne(() => Manager, (manager) => manager.communityUser)
  manager: Manager;

  @OneToMany(() => Post, (post) => post.communityUser)
  posts: Post[];
}
