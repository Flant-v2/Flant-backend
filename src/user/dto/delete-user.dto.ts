import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteUserDto {
  /**
   * 비밀번호
   * @example "Example1!"
   */
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요.' })
  @IsString()
  password: string;
}
