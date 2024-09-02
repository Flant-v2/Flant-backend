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
import { COMMUNTIY_USER_ROLES_KEY } from '../decorators/community-user-roles.decorator';
import _ from 'lodash';
import { CommunityUserRole } from 'src/community/community-user/types/community-user-role.type';
import { AdminArtistService } from 'src/admin/services/admin-artist.service';
import { AdminManagerService } from 'src/admin/services/admin-manager.service';

@Injectable()
export class CommunityUserGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly communityUserService: CommunityUserService,
    private readonly artistService: AdminArtistService,
    private readonly managerService: AdminManagerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: CommunityUserRole[] = this.reflector.get(
      COMMUNTIY_USER_ROLES_KEY,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();

    const userId = request.user?.id;
    let { communityId } = request.body;
    if (request?.params?.communityId) communityId = request.params.communityId;

    if (!userId) {
      throw new NotFoundException(MESSAGES.AUTH.COMMON.COMMUNITY_USER.NO_USER);
    }

    if (!communityId) {
      throw new NotFoundException(
        MESSAGES.AUTH.COMMON.COMMUNITY_USER.NO_COMMUNITY,
      );
    }

    const existedCommunityUser =
      await this.communityUserService.findByCommunityIdAndUserId(
        communityId,
        userId,
      );

    // Roles 지정하지 않을 경우 communityUser만 검사
    if (_.isEmpty(roles) && existedCommunityUser) {
      return true;
    }

    // Roles 설정시 Roles(ARIST,MANAGER) + communityUser 검사
    let hasRole = false;
    const communityUserId = existedCommunityUser.communityUserId;
    if (roles.includes(CommunityUserRole.ARTIST)) {
      try {
        const artistInfo =
          await this.artistService.findByCommunityUserId(communityUserId);
        request.user.roleInfo = artistInfo;
        hasRole = true;
      } catch (e) {}
    }

    if (roles.includes(CommunityUserRole.MANAGER)) {
      try {
        const managerInfo =
          await this.managerService.findByCommunityUserId(communityUserId);
        request.user.roleInfo = managerInfo;
        hasRole = true;
      } catch (e) {}
    }

    if (!hasRole) {
      throw new ForbiddenException(MESSAGES.AUTH.COMMON.FORBIDDEN);
    }

    return true;
  }
}
