import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Community } from 'src/community/entities/community.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(CommunityUser)
    private readonly communityUserRepository: Repository<CommunityUser>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
  ) {}
  // 게시물 신고하기
  reportPost(createReportDto: CreateReportDto, communityId, postId, userId) {
    const { type, content } = createReportDto;

    // 해당 커뮤니티 유저 ID 찾기
    const existedCommunityUser = this.communityUserRepository.findOneBy({
      communityId,
      userId,
    });
    // 유효성검증 start
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');
    // 해당 커뮤니티 유저 ID가 없을 때 에러
    if (!existedCommunityUser)
      throw new NotFoundException('커뮤니티 유저가 없습니다.');
    // type 혹은 content가 null값일 때 에러
    if (!type || !content)
      throw new NotFoundException('유형 혹은 내용을 다시 확인해주세요.');
    // 해당 postId에 맞는 post가 없을 때 에러
    const existedPost = this.postRepository.findOneBy({ postId });
    if (!existedPost) throw new NotFoundException('해당 게시물이 없습니다.');
    // 유효성검증 end

    // 신고내역 저장
    const report = this.reportRepository.create({
      communityUserId: +existedCommunityUser,
      postId: +existedPost,
      type,
      content,
    });

    return report;
  }

  // 댓글 신고하기
  reportComment(
    createReportDto: CreateReportDto,
    communityId,
    postId,
    commentId,
    userId,
  ) {
    const { type, content } = createReportDto;
    // 해당 커뮤니티 유저 ID 찾기
    const existedCommunityUser = this.communityUserRepository.findOneBy({
      communityId,
      userId,
    });
    // 유효성검사 start
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');
    // 해당 커뮤니티 유저 ID가 없을 때 에러
    if (!existedCommunityUser)
      throw new NotFoundException('커뮤니티 유저가 없습니다.');
    // type 혹은 content가 null값일 때 에러
    if (!type || !content)
      throw new NotFoundException('유형 혹은 내용을 다시 확인해주세요.');
    // 해당 postId에 맞는 post가 없을 때 에러
    const existedPost = this.postRepository.findOneBy({ postId });
    if (!existedPost) throw new NotFoundException('해당 게시물이 없습니다.');
    // 해당 commentId에 맞는 comment가 없을 때 에러
    const existedComment = this.commentRepository.findOneBy({ commentId });
    if (!existedComment) throw new NotFoundException('해당 댓글이 없습니다.');
    // 유효성검사 end

    // 신고내역 저장
    const report = this.reportRepository.create({
      communityUserId: +existedCommunityUser,
      postId: +existedPost,
      commentId: +existedComment,
      type,
      content,
    });

    return report;
  }

  // 게시물 신고내역 전체 조회
  findAllPostReport(communityId) {
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');
    return;
  }

  // 게시물 신고내역 상세 조회
  findOnePostReport(communityId, postId) {
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');
    // 해당 postId에 맞는 post가 없을 때 에러
    const existedPost = this.postRepository.findOneBy({ postId });
    if (!existedPost) throw new NotFoundException('해당 게시물이 없습니다.');

    // postId에 맞는 신고내역 조회. ( commentId가 null값일 때 )
    const allReportPost = this.reportRepository.findOneBy({
      postId: +existedPost,
      commentId: null,
    });
    return allReportPost;
  }
  // 댓글 신고내역 전체 조회
  findAllCommentReport(communityId) {
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');
  }

  // 댓글 신고내역 상세 조회
  findOneCommentReport(communityId, postId, commentId) {
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');
    // 해당 postId에 맞는 post가 없을 때 에러
    const existedPost = this.postRepository.findOneBy({ postId });
    if (!existedPost) throw new NotFoundException('해당 게시물이 없습니다.');
    // 해당 commentId에 맞는 comment가 없을 때 에러
    const existedComment = this.commentRepository.findOneBy({ commentId });
    if (!existedComment) throw new NotFoundException('해당 댓글이 없습니다.');

    // postId에 맞는 신고내역 조회. ( commentId가 null값이 아닐 때 )
    const oneReportPost = this.reportRepository.findOneBy({
      postId: +existedPost,
      commentId: +existedComment,
    });
    return oneReportPost;
  }
}
