import { PickType } from '@nestjs/swagger';
import { CommunityUser } from '../community-user/entities/communityUser.entity';

export class CommunityAssignDto extends PickType(CommunityUser, ['nickName']) {}
