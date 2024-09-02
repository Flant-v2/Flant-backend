import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Column } from 'typeorm';

export class UpdateMerchandiseDto {
  /**
   * 커뮤니티 id
   * @example 1
   */
  @IsNotEmpty({ message: '커뮤니티 id를 입력해주세요' })
  @IsNumber()
  @Column({ unsigned: true })
  communityId: number;
  
  /**
   * 이름
   * @example "수정 이름"
   */
  @IsOptional()
  @IsString()
  merchandiseName?: string;

  /**
   * 썸네일
   * @example "수정 썸네일"
   */
  @IsOptional()
  @IsString()
  thumbnail?: string;

  /**
   * 내용
   * @example "수정 내용"
   */
  @IsOptional()
  @IsString()
  content?: string;

  /**
   * 배송비
   * @example 3000
   */
  @IsOptional()
  @IsNumber()
  price?: number;

  /**
   * 이미지
   * @example ["test1.jpg","test2.jpg","test3.jpg"]
   */
  @IsOptional()
  @IsArray({ message: '이미지 URL은 배열로 입력해주세요' })
  @IsString({ each: true, message: '이미지 URL은 문자열이어야 합니다' })
  imageUrl?: string[];

  /**
   * 옵션명
   * @example ["1번 옵션", "2번 옵션", "3번 옵션"]
   */
  @IsOptional()
  @IsArray({ message: '옵션은 배열로 넣어주세요' })
  @IsString({ each: true, message: '옵션은 문자열이어야 합니다' })
  optionName?: string[];
}
