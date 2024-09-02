import { PickType } from '@nestjs/swagger';

import { Merchandise } from '../entities/merchandise.entity';

import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMerchandiseDto extends PickType(Merchandise, [
  'merchandiseName',
  'thumbnail',
  'content',
  'price',
  'communityId',
  'merchandiseCategoryId'
]) {

  /**
   * 이미지 URL
   * @example ["test1.jpg","test2.jpg","test3.jpg"]
   */
  @IsArray({ message: '이미지 URL은 배열로 입력해주세요' })
  @ArrayNotEmpty({ message: '이미지 URL을 입력해주세요 ' })
  @IsString({ each: true, message: '이미지 URL은 문자열이어야 합니다' })
  imageUrl: string[];

  /**
   * 상품 옵션
   * @example ["1번 옵션", "2번 옵션", "3번 옵션"]
   */
  @IsArray({ message: '옵션은 배열로 넣어주세요' })
  @ArrayNotEmpty({ message: '옵션을 입력해주세요 ' })
  @IsString({ each: true, message: '옵션은 문자열이어야 합니다' })
  options: string[];
}
