import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, filter, map } from 'rxjs';

@Injectable()
export class NotificationService {
  private users$: Subject<any> = new Subject();

  private observer = this.users$.asObservable();

  // 이벤트 발생 함수
  emitCardChangeEvent(userId: number) {
    // next를 통해 이벤트를 생성
    this.users$.next({ id: userId });
  }
  // 이벤트 연결
  sendClientAlarm(userId: number): Observable<any> {
    // 이벤트 발생시 처리 로직
    console.log(userId);
    return this.observer.pipe(
      //이벤트 스트림을 구독
      // 유저 필터링 = userId가 일치하는 이벤트만 필터링
      filter((user) => user.id === userId),
      // map 연산자를 통해 데이터 전송
      map((user) => {
        return {
          data: {
            message: '안녕하세',
          },
        } as MessageEvent;
      }),
    );
  }
}
