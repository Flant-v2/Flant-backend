import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import bcrypt from 'bcrypt';
import { MESSAGES } from 'src/constants/message.constant';
import { CheckPasswordDto } from './dto/check-password-dto';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUserResponse(user: User) {
    return {
      id: user.userId,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      role: user.role,
    };
  }

  // 내 정보 조회
  async findMe(userId: number) {
    console.log(userId);
    const user = await this.userRepository.findOne({
      where: { userId: userId },
    });
    console.log(user);
    if (!user) {
      throw new NotFoundException(MESSAGES.USER.COMMON.NOT_FOUND);
    }

    return this.createUserResponse(user);
  }

  // 다른 사람 정보 조회
  async findUser(userId: number) {
    const user = await this.userRepository.findOneBy({
      userId: userId,
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.COMMON.NOT_FOUND);
    }

    return this.createUserResponse(user);
  }

  async checkPassword(userId: number, checkPasswordDto: CheckPasswordDto) {
    const { password } = checkPasswordDto;

    const user = await this.userRepository.findOne({
      where: { userId: userId },
      select: { password: true },
    });

    // 현재 비밀번호가 일치 확인
    const isPasswordMatched = bcrypt.compareSync(password, user.password);

    if (!isPasswordMatched)
      throw new BadRequestException(
        MESSAGES.AUTH.COMMON.PASSWORD.PASSWORD_MISMATCH,
      );
  }

  // 사용자 프로필 이미지 업로드
  async uploadProfileImage(userId: number, profileImage: string) {
    const existedUser = await this.userRepository.findOneBy({
      userId,
    });

    if (!existedUser) {
      throw new NotFoundException(MESSAGES.USER.COMMON.NOT_FOUND);
    }

    if (!profileImage) {
      throw new NotFoundException(MESSAGES.USER.COMMON.PROFILE_IMAGE.REQUIRED);
    }

    const updateUser = await this.userRepository.update(userId, {
      profileImage,
    });

    return updateUser;
  }

  // 내 정보 수정
  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const { newUserName, newPassword, confirmNewPassword } = updateUserDto;
    console.log(updateUserDto);
    console.log('zzzzzzzzzzz');
    console.log(newUserName);
    console.log('bb');

    // 아이디 변경의 경우
    if (
      newUserName != null &&
      newPassword == null &&
      confirmNewPassword == null
    ) {
      const whereCondition = userId;
      const whereContent = {
        ...(newUserName && { name: newUserName }),
      };
      console.log('zzzzzzzzzzz');
      const updateUser = await this.userRepository.update(
        whereCondition,
        whereContent,
      );

      return updateUser;
    }
    // 비밀번호 변경의 경우
    if (newPassword) {
      // 새 비밀번호 일치 확인
      const isNewPasswordMatched = newPassword === confirmNewPassword;
      if (!isNewPasswordMatched) {
        throw new BadRequestException(
          MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.NEW_PASSWORD_MISMATCH,
        );
      }
    }
    console.log('zzzzzzzzzzz');
    // 비밀번호 hash 처리
    const hashRounds = this.configService.get<number>('PASSWORD_HASH');
    const hashedPassword = bcrypt.hashSync(newPassword, hashRounds);

    const existedUser = await this.userRepository.findOneBy({
      userId: userId,
    });

    if (!existedUser) {
      throw new NotFoundException(MESSAGES.USER.COMMON.NOT_FOUND);
    }

    // 회원 정보 수정 로직
    const whereCondition = userId;
    const whereContent = {
      ...(newUserName && { name: newUserName }),
      ...(newPassword && { password: hashedPassword }),
    };
    console.log('zzzzzzzzzzz');
    const updateUser = await this.userRepository.update(
      whereCondition,
      whereContent,
    );

    return updateUser;
  }

  // 회원 탈퇴
  async deleteUser(userId: number) {
    // 비밀번호 일치 확인
    // const user = await this.userRepository.findOne({
    //   where: { userId: userId },
    //   select: { password: true },
    // });
    // if (!user) throw new BadRequestException(MESSAGES.USER.COMMON.NOT_FOUND);

    // const isPasswordMatched = bcrypt.compareSync(
    //   password,
    //   user?.password ?? '',
    // );

    // if (!isPasswordMatched)
    //   throw new BadRequestException(
    //     MESSAGES.AUTH.COMMON.PASSWORD.PASSWORD_MISMATCH,
    //   );

    return await this.userRepository.delete({ userId: userId });
  }

  // //refreshToken
  // //validate의 refreshTokenMatches를 통해,
  // //해당 user의 row에 있는 refresh token이 request의 refresh token과 일치한지 여부를 확인
  // async refreshTokenMatches(refreshToken: string, no: number): Promise<User> {
  //   const user = await this.findByNo(no);

  //   const isMatches = this.isMatch(refreshToken, user.refresh_token);
  //   if (isMatches) return user;
  // }
}
