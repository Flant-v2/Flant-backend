import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The ID of the community' })
  @IsNotEmpty()
  @IsNumber()
  communityId: number;

  // @ApiProperty({ description: 'The ID of the artist', required: false })
  // @IsOptional()
  // @IsNumber()
  // artistId: number | null;

  @ApiProperty({ description: 'The comment text' })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({ description: 'The URL of the image', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl: string | null;
}
