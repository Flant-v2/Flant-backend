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
  reportComment(
    @Body() createReportDto: CreateReportDto,
    @Param('communityId') communityId: number,
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @UserInfo() user: PartialUser,
  ) {
    const data = this.reportService.reportComment(
      createReportDto,
      communityId,
      postId,
      commentId,
      user.id,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: '댓글을 정상적으로 신고했습니다.',
    };
  }

  @ApiOperation({ summary: '게시물 신고내역 전체 조회' })
  @Get('communities/:communityId/posts')
  async findAllPostReport(@Param('communityId') communityId: number) {
    return await this.reportService.findAllPostReport(communityId);
  }

  @ApiOperation({ summary: '게시물 신고내역 상세 조회' })
  @Get('communities/:communityId/posts/:postId')
  findOnePostReport(
    @Param('postId') postId: number,
    @Param('communityId') communityId: number,
  ) {
    return this.reportService.findOnePostReport(communityId, postId);
  }

  @ApiOperation({ summary: '댓글 신고내역 전체 조회' })
  @Get('communities/:communityId/comments')
  findAllCommentReport(@Param('communityId') communityId: number) {
    return this.reportService.findAllCommentReport(communityId);
  }

  @ApiOperation({ summary: '댓글 신고내역 상세 조회' })
  @Get('communities/:communityId/comments/:commentId')
  findOneCommentReport(
    @Param('commentId') commentId: number,
    @Param('communityId') communityId: number,
  ) {
    return this.reportService.findOneCommentReport(communityId, commentId);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // 사용자 정지 등록하기
  /*
  @Post()
  blockUser(@Body() createReportDto: CreateReportDto) {
    return this.reportService.create(createReportDto);
  }

  // 사용자 정지 해제하기
  @Delete(':id')
  blockRemoveUser(@Param('id') id: string) {
    return this.reportService.remove(+id);
  }
    */
}
