import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService], // 다른 모듈에서 NotificationService 사용할 수 있도록 export
})
export class NotificationModule {}
