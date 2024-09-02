import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Membership } from './membership.entity';
import { MembershipPaymentType } from '../types/membership-payment-type.enum';
import { Community } from 'src/community/entities/community.entity';

@Entity('membership_payments')
export class MembershipPayment {
  @PrimaryGeneratedColumn({ unsigned: true })
  membershipPaymentId: number;

  @Column({ unsigned: true })
  userId: number;

  @Column({ unsigned: true })
  membershipId: number;

  @Column({ unsigned: true })
  communityId: number;

  @Column({ unsigned: true })
  price: number;

  @Column()
  type: MembershipPaymentType;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.membershipPayment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Membership, (membership) => membership.membershipPayment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'membership_id' })
  membership: Membership;

  @ManyToOne(() => Community, (community) => community.membershipPayment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'community_id' })
  community: Community;
}
