import { Module } from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Artist } from './entities/artist.entity';
import { Manager } from './entities/manager.entity';
import { Community } from 'src/community/entities/community.entity';
import { AdminArtistController } from './controllers/admin-artist.controller';
import { AdminManagerController } from './controllers/admin-manager.controller';
import { AdminArtistService } from './services/admin-artist.service';
import { AdminManagerService } from './services/admin-manager.service';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Artist, Manager, Community, CommunityUser]),
    AuthModule,
  ],
  controllers: [AdminArtistController, AdminManagerController],
  providers: [AdminArtistService, AdminManagerService],
  exports: [AdminArtistService, AdminManagerService],
})
export class AdminModule {}
