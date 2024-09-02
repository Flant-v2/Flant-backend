import { Form } from 'src/form/entities/form.entity';
import { IsInt, IsNotEmpty, IsString, Validate } from 'class-validator';
import { MESSAGES } from 'src/constants/message.constant';
import { IsNotEmptyConstraint } from 'src/util/decorators/is-not-emtpy-constraint.decorator';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { Community } from './../../community/entities/community.entity';
import { Notice } from './../../notice/entities/notice.entity';

@Entity('managers')
export class Manager {
  @PrimaryGeneratedColumn({unsigned: true})
  managerId: number;
  /**
   * 그룹 ID
   * @example 1
   */
  @IsNotEmpty({ message: MESSAGES.COMMUNITY.COMMON.COMMUNITYID.REQUIRED })
  @IsInt()
  @Column({unsigned: true})
  communityId: number;

  /**
   * 회원 ID
   * @example 1
   */
  @IsNotEmpty({ message: MESSAGES.USER.COMMON.USERID.REQUIRED })
  @IsInt()
  @Column({unsigned: true})
  communityUserId: number;

  /**
   * 매니저 닉네임
   * @example "츄 매니저 닉네임"
   */
  @IsNotEmpty({ message: MESSAGES.MANAGER.COMMON.NICKNAME.REQUIRED })
  @Validate(IsNotEmptyConstraint)
  @IsString()
  @Column()
  managerNickname: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Form, (form) => form.manager)
  form: Form[];

  @OneToOne(() => CommunityUser, (communityUser) => communityUser.manager)
  @JoinColumn({name: 'community_user_id'})
  communityUser: CommunityUser;

  @ManyToOne(() => Community, (community) => community.manager)
  @JoinColumn({name: 'community_id'})
  community: Community;

  @OneToMany(() => Notice, (notice) => notice.manager)
  notice: Notice[];
}
