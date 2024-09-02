import { IsNotEmpty, Validate } from 'class-validator';
import { MESSAGES } from 'src/constants/message.constant';
import { IsNotEmptyConstraint } from 'src/util/decorators/is-not-emtpy-constraint.decorator';

export class CheckPasswordDto {
  /**
   * 비밀번호 확인
   * @example "Example1!"
   */
  @IsNotEmpty({ message: MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.REQUIRED })
  @Validate(IsNotEmptyConstraint)
  password: string;
}
