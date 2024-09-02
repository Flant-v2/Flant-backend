import { PickType } from '@nestjs/swagger';
import { Community } from '../entities/community.entity';
import { IsOptional, IsString, Validate } from 'class-validator';
import { IsNotEmptyConstraint } from 'src/util/decorators/is-not-emtpy-constraint.decorator';

export class UpdateCommunityDto extends PickType(Community, [
  'membershipPrice',
]) {
  /**
   * 커뮤니티(그룹) 이름
   * @example "Celestial Born"
   */
  @IsOptional()
  @Validate(IsNotEmptyConstraint)
  @IsString()
  communityName: string;
}
