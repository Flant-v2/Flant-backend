import { SetMetadata } from '@nestjs/common';
import { CommunityUserRole } from 'src/community/community-user/types/community-user-role.type';

export const COMMUNTIY_USER_ROLES_KEY = 'roles';
export const CommunityUserRoles = (...roles: CommunityUserRole[]) =>
  SetMetadata(COMMUNTIY_USER_ROLES_KEY, roles);
