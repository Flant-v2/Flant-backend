import { Module } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './entities/notice.entity';
import { NoticeImage } from './entities/notice-image.entity';
import { Manager } from 'src/admin/entities/manager.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CommunityUserModule } from 'src/community/community-user/community-user.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notice, NoticeImage, Manager]),
    CommunityUserModule,
    AdminModule,
  ],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {}
