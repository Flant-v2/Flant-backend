import { PickType } from '@nestjs/swagger';
import { Live } from '../entities/live.entity';

export class CreateLiveDto extends PickType(Live, [
  'title',
  'communityId',
  'thumbnailImage'
]) {}
