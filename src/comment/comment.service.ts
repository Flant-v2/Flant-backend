import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { MESSAGES } from 'src/constants/message.constant';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>, // Comment 엔티티에 대한 Repository 주입
    @InjectRepository(CommunityUser)
    private communityUserRepository: Repository<CommunityUser>, // Comment 엔티티에 대한 Repository 주입
  ) {}

  /**
   * 새로운 댓글을 생성합니다.
   * @param commentData - 생성할 댓글의 데이터
   * @returns 생성된 댓글
   */
  async createComment(commentData: Partial<Comment>): Promise<Comment> {
    const comment = this.commentRepository.create(commentData); // 댓글 엔티티 인스턴스 생성
    return this.commentRepository.save(comment); // 댓글을 데이터베이스에 저장
  }

  /**
   * 모든 댓글을 조회합니다.
   * @returns 댓글 배열
   */
  async findAll(): Promise<Comment[]> {
    return this.commentRepository.find(); // 데이터베이스에서 모든 댓글 조회
  }

  /**
   * 주어진 ID로 댓글을 조회합니다.
   * @param id - 조회할 댓글의 ID
   * @returns 조회된 댓글
   */
  async findOne(id: number): Promise<Comment> {
    return this.commentRepository.findOne({ where: { commentId: id } }); // ID로 댓글 조회
  }

  /**
   * 주어진 ID의 댓글을 업데이트합니다.
   * @param id - 업데이트할 댓글의 ID
   * @param commentData - 업데이트할 데이터
   */
  async update(
    user: PartialUser,
    id: number,
    commentData: Partial<Comment>,
  ): Promise<void> {
    const userId = user.id;
    const comment = await this.commentRepository.findOne({
      where: { commentId: id },
    });

    // 현재 사용자가 속한 모든 communityUserId 조회
    const communityUsers = await this.communityUserRepository.find({
      where: { userId },
    });
    // 사용자가 속한 모든 커뮤니티의 communityUserId 목록 생성
    const communityUserIds = communityUsers.map((cu) => cu.communityUserId);
    // 댓글의 communityUserId가 사용자의 communityUserId 목록에 포함되는지 확인
    if (!communityUserIds.includes(comment.communityUserId)) {
      throw new ForbiddenException(MESSAGES.COMMENT.UPDATE.UNAUTHORIZED);
    }

    await this.commentRepository.update(id, commentData); // ID로 댓글을 찾아 업데이트
  }

  /**
   * 주어진 ID의 댓글을 삭제합니다.
   * @param id - 삭제할 댓글의 ID
   */
  async remove(user: PartialUser, id: number) {
    const userId = user.id;

    const comment = await this.commentRepository.findOne({
      where: { commentId: id },
    });

    // 현재 사용자가 속한 모든 communityUserId 조회
    const communityUsers = await this.communityUserRepository.find({
      where: { userId },
    });
    // 사용자가 속한 모든 커뮤니티의 communityUserId 목록 생성
    const communityUserIds = communityUsers.map((cu) => cu.communityUserId);
    // 댓글의 communityUserId가 사용자의 communityUserId 목록에 포함되는지 확인
    if (!communityUserIds.includes(comment.communityUserId)) {
      throw new ForbiddenException(MESSAGES.COMMENT.DELETE.UNAUTHORIZED);
    }

    return await this.commentRepository.delete(id); // 댓글 엔티티 인스턴스 생성
  }

  /**
   * 특정 게시물에 대한 댓글을 조회합니다.
   * @param postId - 게시물의 ID
   * @returns 해당 게시물의 댓글 배열
   */
  async findCommentsByPost(postId: number): Promise<Comment[]> {
    return this.commentRepository.find({ where: { postId } }); // 게시물 ID로 댓글 조회
  }

  /**
   * 새로운 대댓글을 생성합니다.
   * @param replyData - 생성할 대댓글의 데이터 (parentCommentId 포함)
   * @returns 생성된 대댓글
   */
  async createReply(replyData: Partial<Comment>): Promise<Comment> {
    const reply = this.commentRepository.create(replyData);
    return this.commentRepository.save(reply);
  }

  /**
   * 특정 댓글에 대한 대댓글을 조회합니다.
   * @param commentId - 대댓글을 조회할 부모 댓글의 ID
   * @returns 해당 댓글에 대한 대댓글 배열
   */
  async findRepliesByComment(commentId: number): Promise<Comment[]> {
    return this.commentRepository.find({ where: { postId: commentId } }); // 부모 댓글 ID로 대댓글 조회
  }
}
