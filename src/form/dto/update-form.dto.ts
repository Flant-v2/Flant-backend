import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

import { FormType } from '../types/form-type.enum';

export class UpdateFormDto {
  /**
   * 제목
   *  @example "Form 수정 제목"
   */
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * 내용
   * @example "Form 수정 내용"
   */
  @IsOptional()
  @IsString()
  content?: string;

  /**
   * 추가할 질문 내용
   * @example ["추가 질문1","추가 질문2","추가 질문3","추가 질문4"]
   */
  @IsOptional()
  @IsArray({ message: '질문은 배열로 입력해주세요' })
  @IsString({ each: true }) //문자열 확인
  addQuestion?: string[];

  /**
   * 삭제 질문 ID
   * @example [1, 2, 3, 4]
   */
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  deleteQuestionId?: number[];

  /**
   * 수정 질문 ID
   * @example [1, 2, 3, 4]
   */
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  updateQuestionId?: number[];

  /**
   * 수정 질문 내용
   * @example ["질문1","질문2","질문3","질문4"]
   */
  @IsOptional()
  @IsArray({ message: '질문은 배열로 입력해주세요' })
  @IsString({ each: true }) //문자열 확인
  updateQuestion?: string[];

  /**
   * 수정 항목 타입
   * @example "idol"
   */
  @IsOptional()
  @IsEnum(FormType)
  formType?: FormType;

  /**
   * 수정 선착순 인원
   * @example "100"
   */
  @IsOptional()
  @IsNumber()
  maxApply?: number;

  /**
   * 수정 예비 인원
   * @example "20"
   */
  @IsOptional()
  @IsNumber()
  spareApply?: number;

  /**
   * 수정 신청 시작 시간
   * @example "2024-08-07 15:00"
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, {
    message: '날짜 및 시간 형식이 올바르지 않습니다. 예: "2024-08-07 15:00"',
  })
  startTime?: string;

  /**
   *  수정 신청 종료 시간
   * @example "2024-08-07 15:00"
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, {
    message: '날짜 및 시간 형식이 올바르지 않습니다. 예: "2024-08-07 15:00"',
  })
  endTime?: string;
}
