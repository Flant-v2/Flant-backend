import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Validate,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityUser } from '../community-user/entities/communityUser.entity';
import { Form } from 'src/form/entities/form.entity';
import { Post } from 'src/post/entities/post.entity';
import { MembershipPayment } from 'src/membership/entities/membership-payment.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Artist } from 'src/admin/entities/artist.entity';
import { Live } from 'src/live/entities/live.entity';
import { Manager } from './../../admin/entities/manager.entity';
import { Merchandise } from 'src/merchandise/entities/merchandise.entity';
import { IsNotEmptyConstraint } from 'src/util/decorators/is-not-emtpy-constraint.decorator';

@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn({ unsigned: true })
  communityId: number;

  /**
   * 커뮤니티(그룹) 이름
   * @example "Celestial Born"
   */
  @IsNotEmpty()
  @Validate(IsNotEmptyConstraint)
  @IsString()
  @Column()
  communityName: string;

  /**
   * 로고 이미지 Url
   * @example "https://www.kasi.re.kr/file/content/20190408102300583_PFFSRTDT.jpg"
   */
  @ApiPropertyOptional({
    example:
      'https://www.kasi.re.kr/file/content/20190408102300583_PFFSRTDT.jpg',
  })
  @IsOptional()
  @IsUrl()
  @Column({ default: null, nullable: true })
  communityLogoImage: string | null;

  /**
   * 커버 이미지 Url
   * @example 'https://www.kasi.re.kr/file/205101983193671.jpg'
   */
  @ApiPropertyOptional({
    example: 'https://www.kasi.re.kr/file/205101983193671.jpg',
  })
  @IsOptional()
  @IsUrl()
  @Column({ default: null, nullable: true })
  communityCoverImage: string | null;

  /**
   * 유료 멤버쉽 가입 금액
   * @example 20000
   */
  @ApiPropertyOptional({
    example: 20000,
  })
  @IsOptional()
  @IsNumber()
  @Column({ unsigned: true, nullable: true })
  membershipPrice: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => CommunityUser, (communityUser) => communityUser.community)
  communityUsers: CommunityUser[];

  @OneToMany(() => Form, (form) => form.community, {})
  form: Form[];

  @OneToMany(() => Post, (post) => post.community)
  posts: Post[];

  @OneToMany(
    () => MembershipPayment,
    (membershipPayment) => membershipPayment.community,
  )
  membershipPayment: MembershipPayment[];

  @OneToMany(() => Artist, (artist) => artist.community)
  artist: Artist[];

  @OneToMany(() => Live, (live) => live.community)
  live: Live[];

  @OneToMany(() => Manager, (manager) => manager.community)
  manager: Manager[];

  @OneToMany(() => Merchandise, (merchandise) => merchandise.community)
  merchandise: Merchandise[];
}
