import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { Repository, Not, IsNull } from 'typeorm';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Community } from 'src/community/entities/community.entity';
import { CommunityUserRole } from 'src/community/community-user/types/community-user-role.type';
import { report } from 'process';
import { time } from 'console';

@Injectable()
export class ReportService {
  private reportPostMap = new Map<number, any>();
  private reportCommentMap = new Map<number, any>();
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
  ) {
    this.reportPostMap = new Map<number, any>();
    this.reportCommentMap = new Map<number, any>();
  }
  // 게시물 신고하기
  async reportPost(
    createReportDto: CreateReportDto,
    communityId,
    postId,
    userId,
  ) {
    const { type, content } = createReportDto;

    // 유효성검증 start
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = await this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');

    // 해당 커뮤니티 유저 ID가 없을 때 에러
    const existedCommunityUser = await this.communityUserRepository.findOneBy({
      communityId,
      userId,
    });
    if (!existedCommunityUser)
      throw new NotFoundException('커뮤니티 유저가 없습니다.');

    // type 혹은 content가 null값일 때 에러
    if (!type || !content)
      throw new NotFoundException('유형 혹은 내용을 다시 확인해주세요.');

    // 해당 postId에 맞는 post가 없을 때 에러
    const existedPost = await this.postRepository.findOneBy({ postId });
    if (!existedPost) throw new NotFoundException('해당 게시물이 없습니다.');

    // 이미 신고한 게시물이라면 에러
    const existedReport = await this.reportRepository.findOneBy({
      communityId,
      postId,
      commentId: null,
      communityUserId: existedCommunityUser.communityUserId,
    });
    if (existedReport) throw new ConflictException('이미 신고한 게시물입니다.');
    // 유효성검증 end

    // 1시간 안에 신고 30개 이상 받을 시, 정지 로직 start

    const currentTime = Date.now(); // 현재 시간 (밀리초)
    // 게시물의 신고 목록 가져오기, 없으면 초기화
    if (!this.reportPostMap.has(postId)) {
      this.reportPostMap.set(postId, []);
    }
    const reportList = this.reportPostMap.get(postId);
    // 현재 신고 시간 추가
    reportList.push(currentTime);
    console.log(reportList);

    // 1시간 후 신고 제거 타이머 설정
    setTimeout(
      () => {
        this.removeExpiredReportByPost(postId, currentTime);
      },
      60 * 60 * 1000, // 1시간 (밀리초)
    );

    // 유효한 신고가 30개 이상이면 역할 변경
    if (reportList.length >= 30) {
      // 게시물 작성자 id 추출
      const postByCommunityUser = await this.postRepository.findOne({
        where: { postId },
      });
      // 사용자 정지 API 실행
      await this.setBanUser(communityId, postByCommunityUser.communityUserId);
    }
    // 신고 30개 이상 정지 로직 end

    // 신고내역 저장
    const report = await this.reportRepository.save({
      communityUserId: existedCommunityUser.communityUserId,
      communityId: existedCommunity.communityId,
      postId: existedPost.postId,
      type,
      content,
    });
    return report;
  }

  // 1시간이 지나면 게시물 신고가 제거 되는 기능
  removeExpiredReportByPost(postId, reportTime) {
    // 해당 게시물에 대한 신고가 있는지
    const reportList = this.reportPostMap.get(postId);
    if (!report) return;

    // 1시간이 지난 신고 제거
    this.reportPostMap.set(
      postId,
      reportList.filter((time) => time !== reportTime),
    );
  }

  // 1시간이 지나면 댓글 신고가 제거 되는 기능
  removeExpiredReportByComment(commentId, reportTime) {
    // 해당 게시물에 대한 신고가 있는지
    const reportList = this.reportCommentMap.get(commentId);
    if (!report) return;

    // 1시간이 지난 신고 제거
    this.reportCommentMap.set(
      commentId,
      reportList.filter((time) => time !== reportTime),
    );
  }

  // 댓글 신고하기
  async reportComment(
    createReportDto: CreateReportDto,
    communityId,
    postId,
    commentId,
    userId,
  ) {
    const { type, content } = createReportDto;
    // 해당 커뮤니티 유저 ID 찾기
    const existedCommunityUser = await this.communityUserRepository.findOneBy({
      communityId,
      userId,
    });

    // 유효성검사 start
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = await this.communityRepository.findOneBy({
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
    const existedPost = await this.postRepository.findOneBy({ postId });
    if (!existedPost) throw new NotFoundException('해당 게시물이 없습니다.');

    // 해당 commentId에 맞는 comment가 없을 때 에러
    const existedComment = await this.commentRepository.findOne({
      where: { commentId },
    });
    if (!existedComment) throw new NotFoundException('해당 댓글이 없습니다.');

    // 이미 신고한 댓글이라면 에러
    const existedReport = await this.reportRepository.findOneBy({
      communityId,
      postId,
      commentId,
      communityUserId: existedCommunityUser.communityUserId,
    });
    if (existedReport) throw new ConflictException('이미 신고한 댓글입니다.');
    // 유효성검사 end

    // 1시간 안에 신고 30개 이상 받을 시, 정지 로직 start

    const currentTime = Date.now(); // 현재 시간 (밀리초)
    // 댓글의 신고 목록 가져오기, 없으면 초기화
    if (!this.reportCommentMap.has(commentId)) {
      this.reportCommentMap.set(commentId, []);
    }
    const reportList = this.reportCommentMap.get(commentId);
    // 현재 신고 시간 추가
    reportList.push(currentTime);
    console.log(reportList);
    // 1시간 후 신고 제거 타이머 설정
    setTimeout(
      () => {
        this.removeExpiredReportByComment(commentId, currentTime);
      },
      60 * 60 * 1000, // 1시간 (밀리초)
    );

    // 유효한 신고가 30개 이상이면 역할 변경
    if (reportList.length >= 30) {
      // 댓글 작성자 id 추출
      const commentByCommunityUser = await this.commentRepository.findOne({
        where: { commentId },
      });
      // 사용자 정지 API 실행
      await this.setBanUser(
        communityId,
        commentByCommunityUser.communityUserId,
      );
    }
    // 신고 30개 이상 정지 로직 end

    // 신고내역 저장
    const report = await this.reportRepository.save({
      communityUserId: +existedCommunityUser.communityUserId,
      communityId: +existedCommunity.communityId,
      postId: +existedPost.postId,
      commentId: +existedComment.commentId,
      type,
      content,
    });
    return report;
  }

  // 게시물 신고내역 전체 조회
  async findAllPostReport(communityId) {
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = await this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');
    const reportedCommunity = await this.reportRepository.findBy({
      communityId,
      commentId: null,
    });

    return reportedCommunity;
  }

  // 게시물 신고내역 상세 조회
  async findOnePostReport(communityId, postId) {
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = await this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');
    // 해당 postId에 맞는 post가 없을 때 에러
    const existedPost = await this.postRepository.findOneBy({ postId });
    if (!existedPost) throw new NotFoundException('해당 게시물이 없습니다.');

    // postId에 맞는 신고내역 조회. ( commentId가 null값일 때 )
    const allReportPost = await this.reportRepository.findOneBy({
      postId: existedPost.postId,
      commentId: null,
    });

    // postId에 맞는 신고 시간 조회
    const reportList = this.reportPostMap.get(postId);
    console.log(reportList);
    return allReportPost;
  }

  // 댓글 신고내역 전체 조회
  findAllCommentReport(communityId) {
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');

    const reportedComment = this.reportRepository.findBy({
      communityId,
      commentId: Not(IsNull()),
    });

    return reportedComment;
  }

  // 댓글 신고내역 상세 조회
  async findOneCommentReport(communityId, commentId) {
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = await this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');

    // 해당 commentId에 맞는 comment가 없을 때 에러
    const existedComment = await this.commentRepository.findOneBy({
      commentId,
    });
    if (!existedComment) throw new NotFoundException('해당 댓글이 없습니다.');

    // postId에 맞는 신고내역 조회. ( commentId가 null값이 아닐 때 )
    const oneReportedComment = this.reportRepository.findOne({
      where: { commentId: existedComment.commentId },
    });
    return oneReportedComment;
  }

  // 사용자 정지 등록하기
  async setBanUser(communityId, communityUserId) {
    // 유효성 검사 start
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = await this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');
    const existedCommunityUser = await this.communityUserRepository.findOne({
      where: { communityUserId },
    });
    if (!existedCommunityUser)
      throw new NotFoundException('커뮤니티 유저가 없습니다.');
    // 유효성 검사 end

    // 정지를 할당시키는 로직 = 커뮤니티 유저 role 바꾸기 (User => Banned )
    const updateCommunityUser = await this.communityUserRepository.update(
      communityUserId,
      { role: CommunityUserRole.BANNED },
    );

    return updateCommunityUser;
  }

  // 사용자 정지 해제하기
  async removeBanUser(communityId, communityUserId) {
    // 유효성 검사 start
    // 해당 커뮤니티가 없을 때 에러
    const existedCommunity = await this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity) throw new NotFoundException('커뮤니티가 없습니다.');
    const existedCommunityUser = await this.communityUserRepository.findOne({
      where: { communityUserId },
    });
    if (!existedCommunityUser)
      throw new NotFoundException('커뮤니티 유저가 없습니다.');
    // 유효성 검사 end

    // 정지를 해제시키는 로직 = 커뮤니티 유저 role 바꾸기 (Banned => User )
    const updateCommunityUser = await this.communityUserRepository.update(
      communityUserId,
      { role: CommunityUserRole.USER },
    );

    return updateCommunityUser;
  }
}
