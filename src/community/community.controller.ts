import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommunityAssignDto } from './dto/community-assign.dto';
import { UserRole } from 'src/user/types/user-role.type';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserInfo } from 'src/util/decorators/user-info.decorator';
import { ApiFile } from 'src/util/decorators/api-file.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';
import { CommunityUserGuard } from 'src/auth/guards/community-user.guard';
import { CommunityUserRoles } from 'src/auth/decorators/community-user-roles.decorator';
import { CommunityUserRole } from './community-user/types/community-user-role.type';
import {
  coverImageUploadFactory,
  logoImageUploadFactory,
} from 'src/util/image-upload/create-s3-storage';
import { CommunityUserService } from './community-user/community-user.service';
import { FindCommunityUserDto } from './dto/find-community-user.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('커뮤니티')
@Controller('v1/communities')
// @UseInterceptors(CacheInterceptor)
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly communityUserService: CommunityUserService,
  ) {}

  /**
   * 커뮤니티 생성
   * @param req
   * @param createCommunityDto
   * @returns
   */
  @ApiBearerAuth()
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  @Post()
  async create(@Body() createCommunityDto: CreateCommunityDto) {
    return await this.communityService.create(createCommunityDto);
  }

  /**
   * 커뮤니티 유저 정보 조회
   * @param communityId
   * @param FindCommunityUserDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('userInfo/:communityId')
  getCommunityUserInfo(
    @Param('communityId', ParseIntPipe) communityId: number,
    @UserInfo() user: PartialUser,
  ) {
    const userInfo = this.communityUserService.findByCommunityUser(
      communityId,
      user.id,
    );

    return userInfo;
  }
  /**
   * 커뮤니티 가입
   * @param userId
   * @param communityId
   * @param nickName
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':communityId/assign')
  async assignCommunity(
    @UserInfo() user: PartialUser,
    @Param('communityId', ParseIntPipe) communityId: number,
    @Body() communityAssignDto: CommunityAssignDto,
  ) {
    return await this.communityService.assignCommunity(
      user.id,
      communityId,
      communityAssignDto,
    );
  }

  /**
   * 전체 커뮤니티 조회(권한 불필요)
   * @returns
   */
  @Get()
  async findAll() {
    return await this.communityService.findAll();
  }

  /**
   * 내가 가입한 커뮤니티 조회
   * @param req
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMy(@UserInfo() user: PartialUser) {
    return await this.communityService.findMy(user.id);
  }

  /**
   * 단일 커뮤니티 조회
   * @returns
   */
  @Get(':communityId')
  async findOne(@Param('communityId', ParseIntPipe) communityId: number) {
    return await this.communityService.findOne(communityId);
  }

  /**
   * 로고 이미지 수정
   * @param communityId
   * @param File
   * @returns
   */
  @ApiBearerAuth()
  @CommunityUserRoles(CommunityUserRole.MANAGER)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  @ApiFile('logoImage', logoImageUploadFactory())
  @Patch(':communityId/logo')
  async updateLogo(
    @Param('communityId', ParseIntPipe) communityId: number,
    @UploadedFile() File: Express.MulterS3.File,
  ) {
    const imageUrl = File?.location;
    return await this.communityService.updateLogo(communityId, imageUrl);
  }

  /**
   * 커버 이미지 수정
   * @param communityId
   * @param File
   * @returns
   */
  @ApiBearerAuth()
  @CommunityUserRoles(CommunityUserRole.MANAGER)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  @ApiFile('coverImage', coverImageUploadFactory())
  @Patch(':communityId/cover')
  async updateCover(
    @Param('communityId', ParseIntPipe) communityId: number,
    @UploadedFile() File: Express.MulterS3.File,
  ) {
    const imageUrl = File?.location;
    return await this.communityService.updateCover(communityId, imageUrl);
  }

  /**
   * 커뮤니티 수정
   * @param req
   * @param communityId
   * @param updateCommunityDto
   * @returns
   */
  @ApiBearerAuth()
  @CommunityUserRoles(CommunityUserRole.MANAGER)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  @Patch(':communityId')
  async updateCommunity(
    @Param('communityId') communityId: number,
    @Body() updateCommunityDto: UpdateCommunityDto,
  ) {
    return await this.communityService.updateCommunity(
      communityId,
      updateCommunityDto,
    );
  }

  /**
   * 커뮤니티 삭제
   * @param req
   * @param communityId
   * @returns
   */
  @ApiBearerAuth()
  @CommunityUserRoles(CommunityUserRole.MANAGER)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  @Delete(':communityId')
  remove(@Param('communityId', ParseIntPipe) communityId: number) {
    return this.communityService.removeCommunity(communityId);
  }
}
