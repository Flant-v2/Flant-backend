import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UserInfo } from 'src/util/decorators/user-info.decorator';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user-role.type';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('신고')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v2/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * 게시물 신고하기
   * @param createReportDto
   * @param communityId
   * @param postId
   * @returns
   */

  @ApiOperation({ summary: '게시글 신고하기' })
  @Post('communities/:communityId/posts/:postId')
  async reportPost(
    @Body() createReportDto: CreateReportDto,
    @Param('communityId') communityId: number,
    @Param('postId') postId: number,
    @UserInfo() user: PartialUser,
  ) {
    const data = await this.reportService.reportPost(
      createReportDto,
      communityId,
      postId,
      user.id,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: '게시물을 정상적으로 신고했습니다.',
      data: data,
    };
  }

  @ApiOperation({ summary: '댓글 신고하기' })
  @Post('communities/:communityId/posts/:postId/comments/:commentId')
  async reportComment(
    @Body() createReportDto: CreateReportDto,
    @Param('communityId') communityId: number,
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @UserInfo() user: PartialUser,
  ) {
    const data = await this.reportService.reportComment(
      createReportDto,
      communityId,
      postId,
      commentId,
      user.id,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: '댓글을 정상적으로 신고했습니다.',
      data: data,
    };
  }

  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '게시물 신고내역 전체 조회' })
  @Get('communities/:communityId/posts')
  async findAllPostReport(@Param('communityId') communityId: number) {
    const data = await this.reportService.findAllPostReport(communityId);

    return {
      statusCode: HttpStatus.OK,
      message: '게시물 신고내역 전체 조회에 성공했습니다.',
      data: data,
    };
  }

  @ApiOperation({ summary: '게시물 신고내역 상세 조회' })
  @Get('communities/:communityId/posts/:postId')
  async findOnePostReport(
    @Param('postId') postId: number,
    @Param('communityId') communityId: number,
  ) {
    const data = await this.reportService.findOnePostReport(
      communityId,
      postId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: '게시물 신고내역 상세 조회에 성공했습니다.',
      data: data,
    };
  }

  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '댓글 신고내역 전체 조회' })
  @Get('communities/:communityId/comments')
  async findAllCommentReport(@Param('communityId') communityId: number) {
    const data = await this.reportService.findAllCommentReport(communityId);
    return {
      statusCode: HttpStatus.OK,
      message: '댓글 신고내역 전체 조회에 성공했습니다.',
      data: data,
    };
  }

  @ApiOperation({ summary: '댓글 신고내역 상세 조회' })
  @Get('communities/:communityId/comments/:commentId')
  async findOneCommentReport(
    @Param('commentId') commentId: number,
    @Param('communityId') communityId: number,
  ) {
    const data = await this.reportService.findOneCommentReport(
      communityId,
      commentId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: '댓글 신고내역 상세 조회에 성공했습니다.',
      data: data,
    };
  }

  // 사용자 정지에 관한 API를 어떤 파일에 둘건지 추후 생각해봐야할듯.
  // 현재로서는 report에 두는게 맞나? 생각이듬
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '사용자 정지 등록하기' })
  @Post('getBan/communities/:communityId/communityUser/:communityUserId')
  async setBanUser(
    @Param('communityId') communityId: number,
    @Param('communityUserId') communityUserId: number,
  ) {
    const setBanUser = await this.reportService.setBanUser(
      communityId,
      communityUserId,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: '사용자 정지 성공했습니다.',
    };
  }

  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '사용자 정지 해제하기' })
  @Delete('deleteBan/communities/:communityId/communityUser/:communityUserId')
  async removeBanUser(
    @Param('communityId') communityId: number,
    @Param('communityUserId') communityUserId: number,
  ) {
    const removeBanUser = await this.reportService.removeBanUser(
      communityId,
      communityUserId,
    );
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: '사용자 정지를 해제했습니다.',
    };
  }
}
