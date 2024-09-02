import {
  Controller,
  Get,
  UseGuards,
  HttpStatus,
  Param,
  Body,
  Patch,
  Delete,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SearchUserParamsDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserInfo } from 'src/util/decorators/user-info.decorator';
import { PartialUser } from './interfaces/partial-user.entity';
import { MESSAGES } from 'src/constants/message.constant';
import { CheckPasswordDto } from './dto/check-password-dto';
import { ApiFile } from 'src/util/decorators/api-file.decorator';
import { UserProfileUploadFactory } from 'src/util/image-upload/create-s3-storage';

@ApiTags('유저')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 내 정보 조회
   * @param user
   * @returns
   */
  @Get('/me')
  async findOne(@UserInfo() user: PartialUser) {
    console.log('------------------------------user');
    console.log(user);
    const data = await this.userService.findMe(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.USER.READ_ME.SUCCEED,
      data,
    };
  }

  /**
   * 다른 유저 정보 조회
   * @param userId
   * @returns
   */
  @Get('/:userId')
  async findUser(@Param() userId: SearchUserParamsDto) {
    const data = await this.userService.findUser(userId.userId);
    return {
      statusCode: HttpStatus.OK,
      message: `${data.name}님 정보 조회에 성공했습니다.`,
      data,
    };
  }

  /**
   * 패스워드 확인
   * @param user
   * @param checkPasswordDto
   * @returns
   */
  @Post('/check-password')
  async checkPassword(
    @UserInfo() user: PartialUser,
    @Body() checkPasswordDto: CheckPasswordDto,
  ) {
    await this.userService.checkPassword(user.id, checkPasswordDto);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.USER.PASSWORD_CHECK.SUCCEED,
    };
  }

  @Patch('/me/profile-image')
  @ApiFile('userProfile', UserProfileUploadFactory())
  async uploadProfileImage(
    @UserInfo() user: PartialUser,
    @UploadedFile() File: Express.MulterS3.File,
  ) {
    await this.userService.uploadProfileImage(user.id, File.location);

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.USER.UPLOAD_PROFILE.SUCCEED,
    };
  }

  /**
   * 내 정보 수정
   * @param userId
   * @param updateUserDto
   * @returns
   */
  @Patch('/me')
  async updateUser(@UserInfo() user: PartialUser, @Body() updateUserDto) {
    await this.userService.updateUser(user.id, updateUserDto);

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.USER.UPDATE_ME.SUCCEED,
    };
  }

  /**
   * 회원 탈퇴
   * @param userId
   * @returns
   */

  @Delete('/me')
  async deleteUser(@UserInfo() user: PartialUser) {
    console.log(user.id);
    await this.userService.deleteUser(user.id);

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.USER.DELETE.SUCCEED,
    };
  }
}
