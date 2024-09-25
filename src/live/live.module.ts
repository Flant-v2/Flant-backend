import { Module } from '@nestjs/common';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Community } from 'src/community/entities/community.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { Live } from './entities/live.entity';
import { CommunityUserService } from 'src/community/community-user/community-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Community, CommunityUser, User, Live]),
  ],
  providers: [
    LiveService,
    CommunityUserService,
  ],
  controllers: [LiveController],
})
export class LiveModule {}
