import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';
import { MESSAGES } from 'src/constants/message.constant';
import { User } from 'src/user/entities/user.entity';

export class SignUpDto extends PickType(User, ['email', 'password', 'name']) {
  /**
   *  비밀번호 확인
   * @example "Example1!"
   */
  @IsNotEmpty({ message: MESSAGES.AUTH.COMMON.PASSWORD.REQUIRED })
  // @IsStrongPassword(
  //   { minLength: 8 },
  //   {
  //     message: MESSAGES.AUTH.COMMON.PASSWORD.INVALID_FORMAT,
  //   },
  // )
  passwordConfirm: string;
}
