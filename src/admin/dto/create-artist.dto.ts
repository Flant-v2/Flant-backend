import { PickType } from '@nestjs/swagger';
import { Artist } from '../entities/artist.entity';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { MESSAGES } from 'src/constants/message.constant';

export class CreateArtistDto extends PickType(Artist, [
  'communityId',
  'artistNickname',
]) {
  @IsNotEmpty({ message: MESSAGES.AUTH.COMMON.COMMUNITY_USER.NO_USER })
  @IsNumber()
  userId: number;
}
