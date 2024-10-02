import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { Community } from 'src/community/entities/community.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { User } from 'src/user/entities/user.entity';
import { MembershipPayment } from './entities/membership-payment.entity';
import { CommunityUserService } from 'src/community/community-user/community-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community,
      CommunityUser,
      Membership,
      MembershipPayment,
      User,
    ]),
  ],
  controllers: [MembershipController],
  providers: [MembershipService, CommunityUserService],
})
export class MembershipModule {}
