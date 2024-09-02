import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Validate,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../types/user-role.type';
import { CommunityUser } from '../../community/community-user/entities/communityUser.entity';
import { MembershipPayment } from '../../membership/entities/membership-payment.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Order } from 'src/order/entities/order.entity';
import { UserProvider } from '../types/user-provider.type';
import { Refreshtoken } from 'src/auth/entities/refresh-token.entity';
import { Exclude } from 'class-transformer';
import { MESSAGES } from 'src/constants/message.constant';
import { IsValidNameConstraint } from 'src/util/decorators/is-valid-name-constraint';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  userId: number;

  /**
   * 이름
   * @example"신짱구"
   */
  @IsNotEmpty({ message: MESSAGES.AUTH.COMMON.NAME.REQUIRED })
  @Validate(IsValidNameConstraint)
  @IsString()
  @Column()
  name: string;
  /**
   * 이메일
   * @example "example@example.com"
   */
  @IsNotEmpty({ message: MESSAGES.AUTH.COMMON.EMAIL.REQUIRED })
  @IsEmail({}, { message: MESSAGES.AUTH.COMMON.EMAIL.INVALID_FORMAT })
  @Column({ unique: true })
  email: string;

  /**
   * 비밀번호
   * @example "Example1!"
   */
  @IsOptional()
  // @IsStrongPassword(
  //   { minLength: 8 },
  //   {
  //     message: MESSAGES.AUTH.COMMON.PASSWORD.INVALID_FORMAT,
  //   },
  // )
  @Column({ select: false, nullable: true })
  password?: string;

  /**
   * 이미지URL
   * @example "https://i.namu.wiki/i/egdn5_REUgKuBUNPwkOg3inD6mLWMntHc-kXttvomkvaTMsWISF5sQqpHsfGJ8OUVqWRmV5xkUyRpD2U6g_oO03po08TisY6pAj5PXunSWaOHtGwrvXdHcL3p9_9-ZPryAadFZUE2rAxiK9vo5cv7w.svg"
   */
  @IsString()
  @Column({
    default:
      'http://thumbnail.10x10.co.kr/webimage/image/basic600/511/B005113308.jpg?cmd=thumb&w=500&h=500&fit=true&ws=false',
  })
  profileImage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @IsEnum(UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.User })
  role: UserRole;

  @IsInt()
  @Column({ default: 1000000 })
  point: number;

  @IsEnum(UserProvider)
  @Column({ type: 'enum', enum: UserProvider, default: UserProvider.Email })
  provider: UserProvider;

  @OneToMany(() => CommunityUser, (communityUser) => communityUser.users)
  communityUsers: CommunityUser[];

  @OneToMany(
    () => MembershipPayment,
    (membershipPayment) => membershipPayment.user,
    { cascade: true },
  )
  membershipPayment: MembershipPayment;

  @OneToOne(() => Refreshtoken, (refreshtoken) => refreshtoken.user, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  refreshtoken: Refreshtoken;
  //카트 연결
  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  //주문 연결
  @OneToMany(() => Order, (order) => order.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  order: Order[];
}
