// src/auth/guards/comment-creation.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CommentCreationGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 사용자가 멤버십을 가지고 있거나 아티스트 매니저인지 확인
    return user && (user.hasMembership || user.isArtistManager);
  }
}
