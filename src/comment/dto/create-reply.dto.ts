import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateReplyDto {
  @IsNotEmpty()
  @IsNumber()
  postId: number; // 댓글이 달린 게시물의 ID

  @IsNotEmpty()
  @IsNumber()
  communityUserId: number; // 댓글 작성자의 ID

  @IsOptional()
  @IsNumber()
  artistId: number | null; // 댓글이 연관된 아티스트의 ID (선택적)

  @IsNotEmpty()
  @IsString()
  comment: string; // 댓글 내용

  @IsOptional()
  @IsUrl()
  imageUrl: string | null; // 댓글에 첨부된 이미지 URL (선택적)

  @IsNotEmpty()
  @IsNumber()
  parentCommentId: number; // 대댓글의 부모 댓글 ID
}
