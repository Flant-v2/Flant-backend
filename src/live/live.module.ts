import { Module } from '@nestjs/common';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Community } from 'src/community/entities/community.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { Artist } from 'src/admin/entities/artist.entity';
import { Live } from './entities/live.entity';
import { CommunityUserService } from 'src/community/community-user/community-user.service';
import { AdminArtistService } from 'src/admin/services/admin-artist.service';
import { AdminManagerService } from 'src/admin/services/admin-manager.service';
import { Manager } from 'src/admin/entities/manager.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Community, CommunityUser, User, Artist, Live, Manager]),
  ],
  providers: [
    LiveService,
    CommunityUserService,
    AdminArtistService,
    AdminManagerService,
  ],
  controllers: [LiveController],
})
export class LiveModule {}
