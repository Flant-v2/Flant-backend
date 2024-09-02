import { Module } from '@nestjs/common';
import { CommunityUserService } from './community-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { CommunityUser } from './entities/communityUser.entity';
import { Community } from '../entities/community.entity';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Community, CommunityUser]),
    // AdminModule,
  ],
  providers: [CommunityUserService],
  controllers: [],
  exports: [CommunityUserService],
})
export class CommunityUserModule {}
