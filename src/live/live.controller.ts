import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  Body,
  Query,
  Param,
  Get,
  Patch,
} from '@nestjs/common';
import { LiveService } from './live.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user-role.type';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateLiveDto } from './dtos/create-live.dto';
import { CommunityUserRoles } from 'src/auth/decorators/community-user-roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommunityUserGuard } from 'src/auth/guards/community-user.guard';
import { CommunityUserRole } from 'src/community/community-user/types/community-user-role.type';
import { UserInfo } from 'src/util/decorators/user-info.decorator';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';
import { UpdateLiveDto } from './dtos/update-live.dto';

@ApiTags('live')
@Controller('/v1/live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  /**
   * 라이브 스트리밍 제목 등록 + 키 받아오기
   *
   * @returns
   */
  @ApiBearerAuth()
  @CommunityUserRoles(CommunityUserRole.ARTIST)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  @Post('/')
  async createLive(@UserInfo() user: PartialUser, @Body() createLiveDto: CreateLiveDto) {
    const { title, thumbnailImage } = createLiveDto;
    const live = await this.liveService.createLive(user.roleInfo.roleId, title, thumbnailImage);
    return {
      status: HttpStatus.CREATED,
      message: '스트림키 생성 완료',
      data: live,
    };
  }

  /**
   * 라이브 목록 조회
   *
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findAllLives(
    @UserInfo() user: PartialUser,
    @Query('communityId') communityId: number,
  ) {
    const lives = await this.liveService.findAllLives(communityId);
    return {
      status: HttpStatus.OK,
      message: '라이브 목록 조회에 성공했습니다.',
      data: lives,
    };
  }

  /**
   * 라이브 실시간 시청
   *
   * @returns
   */
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Get('/:liveId')
  async watchLive(@UserInfo() user: PartialUser, @Param('liveId') liveId: number) {
    const live = await this.liveService.watchLive(liveId);
    return {
      status: HttpStatus.OK,
      message: '라이브 받아오기에 성공했습니다.',
      data: live,
    };
  }

  /**
   * 라이브 다시보기
   *
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/:liveId/recordings')
  async watchRecordedLive(
    @UserInfo() user: PartialUser,
    @Param('liveId') liveId: number,
  ) {
    const live = await this.liveService.watchRecordedLive(liveId);
    return {
      status: HttpStatus.OK,
      message: '라이브 녹화본 불러오기에 성공했습니다.',
      data: live,
    };
  }

  /**
   * 라이브 정보 수정
   *
   * @returns
   */
  @ApiBearerAuth()
  @CommunityUserRoles(CommunityUserRole.MANAGER)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  @Patch('/:liveId')
  async updateLive(
    @UserInfo() user: PartialUser,
    @Param('liveId') liveId: number,
    @Body() updateLiveDto: UpdateLiveDto,
  ) {
    const live = await this.liveService.updateLive(liveId, updateLiveDto);
    return {
      status: HttpStatus.OK,
      message: '라이브 수정이 완료되었습니다.',
      data: live,
    };
  }
}
