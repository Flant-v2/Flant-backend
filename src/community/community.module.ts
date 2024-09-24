import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { Community } from './entities/community.entity';
import { CommunityUser } from './community-user/entities/communityUser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/user/entities/user.entity';
import { CommunityUserModule } from './community-user/community-user.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Community, CommunityUser, User]),
    CommunityUserModule,
    AdminModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityService, NotificationService],
})
export class CommunityModule {}
