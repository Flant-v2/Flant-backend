import { Injectable, BadRequestException, Request } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProvider } from 'src/user/types/user-provider.type';
import { BADNAME } from 'dns';
import { MESSAGES } from 'src/constants/message.constant';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { hash } from 'bcrypt';
import { Refreshtoken } from './entities/refresh-token.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartItem } from 'src/cart/entities/cart.item.entity';
import { Merchandise } from 'src/merchandise/entities/merchandise.entity';
import { MerchandiseOption } from 'src/merchandise/entities/marchandise-option.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectRepository(Refreshtoken)
    private readonly refreshtokenRepository: Repository<Refreshtoken>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Merchandise)
    private readonly merchandisePostRepository: Repository<Merchandise>,
    @InjectRepository(MerchandiseOption)
    private readonly merchandiseOptionRepository: Repository<MerchandiseOption>,
  ) {}

  // 회원가입
  async signUp({
    name,
    email,
    password,
    passwordConfirm,
    //profileImage,
  }: SignUpDto) {
    // 기존 이메일로 가입된 이력이 있을 경우 False
    const existedEmail = await this.userRepository.findOneBy({ email });
    if (existedEmail)
      throw new BadRequestException(MESSAGES.AUTH.COMMON.DUPLICATED);

    // 비밀번호가 Null값일 때, False 반환
    if (!password)
      throw new BadRequestException(MESSAGES.AUTH.COMMON.PASSWORD.REQUIRED);

    // 비밀번호와 비밀번호 확인이랑 일치하는 지
    const isPasswordMatched = password === passwordConfirm;
    if (!isPasswordMatched) {
      throw new BadRequestException(
        MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.NOT_MATCHED_WITH_PASSWORD,
      );
    }
    // 비밀번호가 영문자, 숫자, 기호를 포함안할시 에러 반환.
    let reg = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
    if (!reg.test(password))
      throw new BadRequestException(
        MESSAGES.AUTH.COMMON.PASSWORD.INVALID_FORMAT,
      );

    // 비밀번호 뭉개기
    const hashRounds = this.configService.get<number>('PASSWORD_HASH');
    const hashedPassword = bcrypt.hashSync(password, hashRounds);

    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      name,
      // profileImage,
    });
    delete user.password;

    return user;
  }

  // 로그인
  async signIn(
    userId: number,
    @Res({ passthrough: true }) res: Response,
    cookies: any,
  ) {
    const { accessToken, ...accessOption } = this.createAccessToken(userId);
    const { refreshToken, ...refreshOption } = this.createRefreshToken(userId);
    console.log('-------------------------------------');
    await this.notUserCartSave(userId, cookies);
    await this.setCurrentRefreshToken(refreshToken, accessToken, userId);
    console.log(accessToken);
    res.cookie('Authentication', accessToken, accessOption);
    res.cookie('Refresh', refreshToken, refreshOption);
    // 쿠키 삭제
    res.clearCookie('guestCart');

    return { accessToken, refreshToken };
  }

  //로그아웃
  async signOut(req) {
    const { accessOption, refreshOption } = this.getCookiesForLogOut();
    console.log(req);
    await this.removeRefreshToken(req.id);

    return { accessOption, refreshOption };
  }

  async validateUser({ email, password }: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: { userId: true, password: true },
    });
    const isPasswordMatched = bcrypt.compareSync(
      password,
      user?.password ?? '',
    );

    // 구글 소셜 로그인 AND 비밀번호가 NULL값 = 사용자가 비밀번호를 따로 설정하지 않음 = 일반 로그인 불가능
    if (user.provider == UserProvider.Google && !user.password)
      throw new BadRequestException(
        MESSAGES.AUTH.COMMON.OAUTH_GOOGLE.PASSWORD.REQUIRED,
      );

    if (!user || !isPasswordMatched) {
      return null;
    }

    return { id: user.userId };
  }

  //구글 로그인
  async googleLogin(req) {
    if (!req.user) {
      return MESSAGES.AUTH.COMMON.OAUTH_GOOGLE.NOT_FOUND;
    }
    console.log(req);
    // 만약 유저테이블에서 같은 이메일이 있다면 false반환
    const existedUser = await this.userRepository.findOneBy({
      email: req.user.email,
    });
    if (existedUser)
      throw new BadRequestException(MESSAGES.AUTH.COMMON.OAUTH.DUPLICATED);

    // 이곳에 유저테이블과 연결지어서 생성
    const user = await this.userRepository.save({
      name: req.user.firstName + req.user.lastName,
      email: req.user.email,
      password: null,
      profileImage: req.user.pircture,
      provider: UserProvider.Google,
    });

    const accessToken = await this.createAccessToken(user.userId);
    return accessToken;
  }

  // accesstoken 생성
  createAccessToken(userId: number) {
    const payload = { id: userId };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });
    console.log(accessToken);
    // accesstoken을 쿠키에 담아 클라이언트에 전달하기 위함
    return {
      accessToken: accessToken,
      domain: 'localhost', // 추후 도메인 수정 할 것.
      path: '/',
      httpOnly: true, // 클라이언트 측 스크립트에서 쿠키에 접근할 수 없어 보안 강화
      //maxAge: Number(this.configService.get('JWT_EXPIRES_IN')) * 1000, //15분
    };
  }
  // refreshtoken 생성
  createRefreshToken(userId: number) {
    const payload = { id: userId };
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('RElFRESH_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
    });
    console.log(refreshToken);
    return {
      refreshToken: refreshToken,
      domain: 'localhost', // 추후 도메인 수정 할 것.
      path: '/',
      httpOnly: true,
      //maxAge: Number(this.configService.get('REFRESH_TOKEN_EXPIRES_IN')) * 1000,
    };
  }
  // 로그아웃시 사용
  getCookiesForLogOut() {
    return {
      accessOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
      refreshOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
    };
  }

  // refreshtoken 데이터베이스에 저장
  async setCurrentRefreshToken(
    refreshToken: string,
    accessToken: string,
    userId: number,
  ) {
    // refreshToken 암호화
    const currentHashedRefreshToken = await hash(refreshToken, 10);
    const updateContent = { refreshtoken: currentHashedRefreshToken };
    // User가 RefreshToken을 가지고 있는지 확인
    const existedRefreshToken = await this.refreshtokenRepository.findOneBy({
      userId,
    });
    // 만약 있다면
    if (existedRefreshToken) {
      await this.refreshtokenRepository.update(userId, updateContent);
    } else {
      // 만약 없다면
      // access token 만료시간 추출
      const expiresTime = this.configService.get<string>('JWT_EXPIRES_IN');
      await this.refreshtokenRepository.save({
        userId,
        accesstoken: accessToken,
        refreshtoken: currentHashedRefreshToken,
        createdAt: new Date(),
        expiresAt: new Date(new Date().getTime() + parseInt(expiresTime)),
      });
    }
  }

  // refreshtoken이 유효한지
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.refreshtokenRepository.findOneBy({ userId });
    const isRefreshTokenMatching = bcrypt.compareSync(
      refreshToken,
      user.refreshtoken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  // refreshtoken 삭제
  async removeRefreshToken(userId: number) {
    const updateCondition = { userId: userId };
    return await this.refreshtokenRepository.update(updateCondition, {
      refreshtoken: null,
    });
  }

  // refreshtoken을 통해 accesstoken 발급
  async getAccessToken(refreshToken: string, userId: number, req) {
    //먼저 쿠키 혹은 로컬에 저장된 refresh와 db에 저장된 refresh가 같은지 확인

    // user가 가진 refreshtoken 조회
    const refreshtoken = await this.refreshtokenRepository.findOneBy({
      userId,
    });
    // refreshtoken이 유효한지 확인
    const validatedRefreshToken = this.getUserIfRefreshTokenMatches(
      refreshToken,
      userId,
    );
    // 유효하지 않다면 로그아웃 ( 재 로그인 바람 )
    if (!validatedRefreshToken) return this.signOut(req);
    // 유요하다면 accesstoken의 유효기간이 만료되었는지 확인
    const currentTime = new Date().getTime();
    const isExpired = currentTime > refreshtoken.expiresAt.getTime();
    // 만료되지 않았는데 토큰을 발급한다면 공격자가 있는거로 간주하고, 로그아웃
    if (!isExpired) return this.signOut(req);
    // 만료되었다면 재발급
    const accesstoken = this.createAccessToken(userId);
    return accesstoken;
  }

  //비회원 카트 이전
  async notUserCartSave(userId: number, cookies: any) {
    const guestCart = cookies['guestCart']
      ? JSON.parse(cookies['guestCart'])
      : [];

    // 유저 추출 및 카트 유효성 검사
    const user = await this.userRepository.findOne({
      where: { userId },
    });
    console.log(guestCart);
    let cart = await this.cartRepository.findOne({
      where: { user: { userId } },
      relations: ['user'],
    });

    //유저 카트가 없다면 카트 생성

    if (!cart) {
      cart = await this.cartRepository.save({
        user,
      });
    }
    console.log(cart);
    // 쿠키 내 각 상품 id + 옵션 id 데이터를 추출하여 userCartItem에 저장하기
    for (const item of guestCart) {
      // merchandisePost 추출
      const merchandisePost = await this.merchandisePostRepository.findOne({
        where: { merchandiseId: item.merchandisePostId },
      });
      // merchandiseOption 추출
      const merchandiseOption = await this.merchandiseOptionRepository.findOne({
        where: { id: item.merchandiseOptionId },
      });
      console.log('0000000000000000000000000000000');
      console.log(merchandisePost);
      console.log(merchandiseOption);
      // userCart에 저장
      await this.cartItemRepository.save({
        cartId: cart.id,
        merchandiseId: merchandisePost.merchandiseId,
        merchandiseOptionId: merchandiseOption.id,
        quantity: item.quantity,
      });
    }
    console.log('test');
  }
}
