import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { Community } from 'src/community/entities/community.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { User } from 'src/user/entities/user.entity';
import { MembershipPayment } from './entities/membership-payment.entity';
import { AdminArtistService } from 'src/admin/services/admin-artist.service';
import { AdminManagerService } from 'src/admin/services/admin-manager.service';
import { CommunityUserService } from 'src/community/community-user/community-user.service';
import { Artist } from 'src/admin/entities/artist.entity';
import { Manager } from 'src/admin/entities/manager.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community,
      CommunityUser,
      Membership,
      MembershipPayment,
      User,
      Artist,
      Manager,
    ]),
  ],
  controllers: [MembershipController],
  providers: [MembershipService, AdminArtistService, AdminManagerService, CommunityUserService],
})
export class MembershipModule {}
