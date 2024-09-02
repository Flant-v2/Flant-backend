import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { NotificationService } from './notification.service';
import { Observable, map } from 'rxjs';
import { Subscription } from 'rxjs';
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/:userId')
  sendClientAlarm(@Param('userId') userId: string, @Res() res: Response) {
    const sseStream = this.notificationService.sendClientAlarm(+userId);

    // HTTP 응답 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 클라이언트로 SSE 데이터 전송
    const subscription: Subscription = sseStream.subscribe((sseData) => {
      const jsonData = JSON.stringify(sseData); // JSON 포맷 설정
      res.write(`data: ${jsonData}\n\n`);
    });

    // 클라이언트 연결 종료 시 SSE 스트림 해제
    res.on('close', () => {
      subscription.unsubscribe();
    });
  }
}
