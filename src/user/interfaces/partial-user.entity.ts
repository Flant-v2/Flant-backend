import { CommunityUserRole } from 'src/community/community-user/types/community-user-role.type';

export interface PartialUser {
  id: number;
  roleInfo: { roleId: number; role: CommunityUserRole };
}
