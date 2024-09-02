import { PickType } from '@nestjs/swagger';
import { Membership } from '../entities/membership.entity';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class MembershipDto {
  /**
   *  커뮤니티 ID
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  communityId: number;
}
