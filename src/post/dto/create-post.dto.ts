import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: '게시글의 내용', required: true })
  content: string;

  @ApiProperty({ description: '커뮤니티 ID' })
  communityId: number;
}
