import { PickType } from '@nestjs/swagger';

import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { FormType } from '../types/form-type.enum';

export class CreateFormDto {
  /**
   * Form 제목
   * @example "인기가요 사전녹화 신청"
   */
  @IsNotEmpty({ message: '제목을 입력해주세요' })
  @IsString()
  title: string;

  /**
   * 내용
   * @example "8월 28일 인기가요 사전녹화 신청 입니다. 출연자는 @@@,@@@ 입니다"
   */
  @IsNotEmpty({ message: '내용을 입력해주세요' })
  @IsString()
  content: string;

  /**
   * 항목 타입
   * @example "idol"
   */
  @IsNotEmpty({ message: '항목을 선택해주세요' })
  @IsEnum(FormType, { message: '유효한 항목 타입을 선택해주세요' })
  formType: FormType;

  /**
   * 커뮤니티 ID
   * @example "1"
   */
  @IsNotEmpty({ message: '커뮤니티 ID를 입력해주세요' })
  @IsNumber()
  communityId: number;

  /**
   * 질문 리스트
   * @example ["이름", "나이", "지역", "신청 이유"]
   */
  @IsOptional()
  @IsArray({ message: '질문은 배열로 입력해주세요' })
  @IsString({ each: true }) //문자열 확인
  question?: string[];

  /**
   * 선착순 인원
   * @example "100"
   */
  @IsNotEmpty({ message: '선착순 인원을 입력해주세요' })
  @IsNumber()
  maxApply: number;

  /**
   * 예비 인원
   * @example "20"
   */
  @IsNotEmpty({ message: '예비 인원을 입력해주세요' })
  @IsNumber()
  spareApply: number;

  /**
   * 신청 시작 시간
   * @example "2024-08-07 15:00"
   */
  @IsNotEmpty({ message: '신청 시작 시간을 입력해주세요' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, {
    message: '날짜 및 시간 형식이 올바르지 않습니다. 예: "2024-08-07 15:00"',
  })
  startTime: string;
  /**
   * 신청 종료 시간
   * @example "2024-08-07 15:00"
   */
  @IsNotEmpty({ message: '신청 종료 시간을 입력해주세요' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, {
    message: '날짜 및 시간 형식이 올바르지 않습니다. 예: "2024-08-07 15:00"',
  })
  endTime: string;
}
