import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/util/decorators/user-info.decorator';
import { ApiFiles } from 'src/util/decorators/api-file.decorator';
import { noticeImageUploadFactory } from 'src/util/image-upload/create-s3-storage';
import { CommunityUserRoles } from 'src/auth/decorators/community-user-roles.decorator';
import { CommunityUserRole } from 'src/community/community-user/types/community-user-role.type';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommunityUserGuard } from 'src/auth/guards/community-user.guard';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('공지사항')
@Controller('v1/notices')
// @UseInterceptors(CacheInterceptor)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  /**
   * 공지 등록
   * @param files
   * @param req
   * @param communityId
   * @param createNoticeDto
   * @returns
   */
  @ApiBearerAuth()
  @CommunityUserRoles(CommunityUserRole.MANAGER)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  @ApiFiles('noticeImage', 3, noticeImageUploadFactory())
  @Post()
  create(
    @UploadedFiles() files: { noticeImage?: Express.MulterS3.File[] },
    @UserInfo() user: PartialUser,
    @Body() createNoticeDto: CreateNoticeDto,
  ) {
    let imageUrl = undefined;
    if (files && files.noticeImage && files.noticeImage.length != 0) {
      const imageLocation = files.noticeImage.map((file) => file.location);
      imageUrl = imageLocation;
    }

    return this.noticeService.create(user, createNoticeDto, imageUrl);
  }

  /**
   * 모든 공지사항 조회
   * @returns
   */
  @Get()
  findAll(@Query('communityId') communityId: number) {
    return this.noticeService.findAll(communityId);
  }

  /**
   * 공지 상세 조회
   * @param noticeId
   * @returns
   */
  @Get(':noticeId')
  findOne(@Param('noticeId') noticeId: number) {
    return this.noticeService.findOne(+noticeId);
  }

  /**
   * 공지 수정
   * @param req
   * @param noticeId
   * @param updateNoticeDto
   * @returns
   */
  @ApiBearerAuth()
  @CommunityUserRoles(CommunityUserRole.MANAGER)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  @ApiFiles('noticeImage', 3, noticeImageUploadFactory())
  @Patch(':noticeId')
  update(
    @UploadedFiles() files: { noticeImage?: Express.MulterS3.File[] },
    @Param('noticeId') noticeId: number,
    @Body() updateNoticeDto: UpdateNoticeDto,
  ) {
    let imageUrl = undefined;
    if (files && files.noticeImage && files.noticeImage.length != 0) {
      const imageLocation = files.noticeImage.map((file) => file.location);
      imageUrl = imageLocation;
    }
    return this.noticeService.update(+noticeId, updateNoticeDto, imageUrl);
  }

  /**
   * 공지 삭제
   * @param req
   * @param noticeId
   * @returns
   */
  @ApiBearerAuth()
  @CommunityUserRoles(CommunityUserRole.MANAGER)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  @Delete(':noticeId')
  remove(@Param('noticeId') noticeId: string) {
    return this.noticeService.remove(+noticeId);
  }
}
