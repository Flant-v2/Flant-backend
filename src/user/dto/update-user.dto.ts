import {
  IsOptional,
  IsString,
  IsStrongPassword,
  IsNotEmpty,
  Validate,
} from 'class-validator';
import { MESSAGES } from 'src/constants/message.constant';
import { IsValidNameConstraint } from 'src/util/decorators/is-valid-name-constraint';

export class UpdateUserDto {
  /**
   * 이름
   * @example 신짱구
   */
  @IsOptional()
  @Validate(IsValidNameConstraint)
  @IsString()
  newUserName?: string;

  /**
   * 새 비밀번호
   * @example "Example2!"
   */
  @IsOptional()
  @IsStrongPassword(
    { minLength: 8 },
    {
      message: `새 비밀번호는 영문 알파벳 대,소문자, 숫자, 특수문자(!@#$%^&*)를 포함해서 8자리 이상으로 입력해야 합니다.`,
    },
  )
  newPassword?: string;

  /**
   * 새 비밀번호 확인
   * @example "Example2!"
   */
  @IsOptional()
  @IsStrongPassword(
    { minLength: 8 },
    {
      message: MESSAGES.AUTH.COMMON.PASSWORD.INVALID_FORMAT,
    },
  )
  confirmNewPassword?: string;
}
