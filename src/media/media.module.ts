import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { MediaFile } from './entities/media-file.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { CommunityUserModule } from 'src/community/community-user/community-user.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, MediaFile]),
    CommunityUserModule,
    AdminModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
