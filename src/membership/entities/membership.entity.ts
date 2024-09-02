import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityUser } from '../../community/community-user/entities/communityUser.entity';
import { MembershipPayment } from './membership-payment.entity';

@Entity('membership')
@Index('unique_active_column', ['communityUserId'], {
  where: '"deletedAt" IS NULL',
})
export class Membership {
  @PrimaryGeneratedColumn({ unsigned: true })
  membershipId: number;

  @Column({ unsigned: true })
  communityUserId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  expiration: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => CommunityUser, (communityUser) => communityUser.membership, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'community_user_id' })
  communityUser: CommunityUser;

  @OneToMany(
    () => MembershipPayment,
    (membershipPayment) => membershipPayment.membership,
  )
  membershipPayment: MembershipPayment;

}
