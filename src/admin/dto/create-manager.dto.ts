import { PickType } from '@nestjs/swagger';
import { Manager } from '../entities/manager.entity';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { MESSAGES } from 'src/constants/message.constant';
export class CreateManagerDto extends PickType(Manager, [
  'communityId',

  'managerNickname',
]) {
  @IsNotEmpty({ message: MESSAGES.AUTH.COMMON.COMMUNITY_USER.NO_USER })
  @IsNumber()
  userId: number;
}
