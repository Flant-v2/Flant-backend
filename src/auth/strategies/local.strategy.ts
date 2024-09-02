import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProvider } from 'src/user/types/user-provider.type';
import { MESSAGES } from 'src/constants/message.constant';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const userInfo = await this.userRepository.findOneBy({ email });
    if (!userInfo)
      throw new UnauthorizedException(MESSAGES.AUTH.COMMON.JWT.UNAUTHORIZED);

    // 구글 소셜 로그인 AND 비밀번호가 NULL값 = 사용자가 비밀번호를 따로 설정하지 않음 = 일반 로그인 불가능
    if (userInfo.provider == UserProvider.Google && !userInfo.password)
      throw new BadRequestException(MESSAGES.AUTH.COMMON.OAUTH_GOOGLE.PASSWORD);

    const user = await this.authService.validateUser({ email, password });
    if (!user) {
      throw new UnauthorizedException(MESSAGES.AUTH.COMMON.JWT.UNAUTHORIZED);
    }

    return user;
  }
}
