import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CommunityUserService } from 'src/community/community-user/community-user.service';
import { MESSAGES } from 'src/constants/message.constant';
import {
  COMMUNTIY_USER_ROLES_KEY,
  CommunityUserRoles,
} from '../decorators/community-user-roles.decorator';
import _ from 'lodash';
import { CommunityUserRole } from 'src/community/community-user/types/community-user-role.type';
import { AdminArtistService } from 'src/admin/services/admin-artist.service';
import { AdminManagerService } from 'src/admin/services/admin-manager.service';

@Injectable()
export class ManagerGuard implements CanActivate {
  constructor(private readonly managerService: AdminManagerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new NotFoundException(MESSAGES.AUTH.COMMON.COMMUNITY_USER.NO_USER);
    }

    //await this.managerService.findByUserId(userId);

    return true;
  }
}
