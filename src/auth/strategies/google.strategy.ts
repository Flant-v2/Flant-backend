import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_SECRET'),
      callbackURL: 'http://localhost:3000/api/v1/auth/google/redirect',
      // Google이 사용자를 인증한 후 제어권을 반환하는 앱의 특정 엔드포인트
      scope: ['email', 'profile'],
    });
  }

  //OAuth2 인증 과정 중 사용자 정보를 검증하는 로직
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.familyName,
      lastName: name.givenName,
      picture: photos[0].value,
      //accessToken,
      //refreshToken 이건 출력이 되지 않는다.
      //보안상의 이유로 리프레시 토큰을 클라이언트에게 전달하지 않는 것이 일반적인 관행
    };
    done(null, user);
  }
}
