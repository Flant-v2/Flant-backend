import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard
  extends AuthGuard('jwt')
  implements CanActivate
{
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (token) {
      return super.canActivate(context); // 토큰이 있으면 기본 인증 로직 진행
    }

    return true;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      return null; // 사용자 정보가 없는 경우 null
    }
    return user; // 인증된 사용자 반환
  }
}
