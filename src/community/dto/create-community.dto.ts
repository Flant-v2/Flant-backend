import { PickType } from '@nestjs/swagger';
import { Community } from '../entities/community.entity';

export class CreateCommunityDto extends PickType(Community, [
  'communityName',
]) {}
