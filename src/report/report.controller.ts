import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UserInfo } from 'src/util/decorators/user-info.decorator';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';

@Controller('v2/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // 게시물 신고하기
  @Post('communities/:communityId/posts/:postId')
  reportPost(
    @Body() createReportDto: CreateReportDto,
    @Param('communityId') communityId: number,
    @Param('postId') postId: number,
    @UserInfo() user: PartialUser,
  ) {
    return this.reportService.reportPost(
      createReportDto,
      communityId,
      postId,
      user.id,
    );
  }

  // 댓글 신고하기
  @Post('communities/:communityId/posts/:postId/comments/commentId')
  reportComment(
    @Body() createReportDto: CreateReportDto,
    @Param('communityId') communityId: number,
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @UserInfo() user: PartialUser,
  ) {
    return this.reportService.reportComment(
      createReportDto,
      communityId,
      postId,
      commentId,
      user.id,
    );
  }

  // 게시물 신고내역 전체 조회
  @Get('communities/:communityId/posts')
  findAllPostReport(@Param('communityId') communityId: number) {
    return this.reportService.findAllPostReport(communityId);
  }

  // 게시물 신고내역 상세 조회
  @Get('communities/:communityId/posts/:postId')
  findOnePostReport(
    @Param('postId') postId: number,
    @Param('communityId') communityId: number,
  ) {
    return this.reportService.findOnePostReport(communityId, postId);
  }

  // 댓글 신고내역 전체 조회
  @Get('communities/:communityId/posts/:postId/comments')
  findAllCommentReport(@Param('communityId') communityId: number) {
    return this.reportService.findAllCommentReport(communityId);
  }

  // 댓글 신고내역 상세 조회
  @Get('communities/:communityId/posts/:postId/comments/:commentId')
  findOneCommentReport(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @Param('communityId') communityId: number,
  ) {
    return this.reportService.findOneCommentReport(
      communityId,
      postId,
      commentId,
    );
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
