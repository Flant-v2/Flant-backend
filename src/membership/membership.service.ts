import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Community } from 'src/community/entities/community.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { DataSource, IsNull, LessThan, Not, Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';
import _ from 'lodash';
import { User } from 'src/user/entities/user.entity';
import { MembershipPayment } from './entities/membership-payment.entity';
import { Cron } from '@nestjs/schedule';
import { MembershipPaymentType } from './types/membership-payment-type.enum';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityUser)
    private readonly communityUserRepository: Repository<CommunityUser>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MembershipPayment)
    private readonly membershipPaymentRepository: Repository<MembershipPayment>,
    private dataSource: DataSource,
  ) {}

  // 기간 만료된 멤버십 자동 삭제
  @Cron('0 0 0 * * *') // 프로덕션 환경에서 코드
  //@Cron('*/30 * * * * *')
  async handleCron() {
    const date = new Date();
    const memberships = await this.membershipRepository.find({
      where: {
        expiration: LessThan(date),
      },
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ UNCOMMITTED');
    try {
      for (let membership of memberships) {
        await queryRunner.manager.softDelete(Membership, {
          membershipId: membership.membershipId,
        });
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createMembership(userId: number, communityId: number) {
    // 유저아이디, 커뮤니티아이디 바탕으로 커뮤니티유저 조회
    const communityUser = await this.communityUserRepository.findOne({
      where: {
        userId,
        communityId,
      },
      relations: ['community', 'membership'],
    });
    if (_.isNil(communityUser)) {
      throw new NotFoundException({
        status: 404,
        message:
          '커뮤니티 가입 정보가 없습니다. 커뮤니티 가입을 먼저 진행해주세요.',
      });
    }
    const existMembership = communityUser.membership.find((cur) => {
      return cur.deletedAt == null;
    });
    if (existMembership) {
      throw new ConflictException({
        status: 409,
        message: '이미 가입된 멤버십입니다.',
      });
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ UNCOMMITTED');
    try {
      const expiration = new Date();
      expiration.setFullYear(expiration.getFullYear() + 1); // 배포용
      expiration.setHours(9);
      expiration.setMilliseconds(0);
      expiration.setSeconds(0);
      expiration.setMinutes(0);
      //xpiration.setMinutes(expiration.getMinutes() + 3); // 테스트용, 3분 간격으로

      // 커뮤니티유저 ID > 멤버쉽 추가
      const membership = this.membershipRepository.create({
        communityUserId: communityUser.communityUserId,
        expiration,
      });

      await queryRunner.manager.save(Membership, membership);

      // 결제내역 저장
      const membershipPayment = this.membershipPaymentRepository.create({
        userId,
        membershipId: membership.membershipId,
        communityId: communityUser.communityId,
        price: communityUser.community.membershipPrice,
        type: MembershipPaymentType.New,
      });
      await queryRunner.manager.save(MembershipPayment, membershipPayment);

      // 유저ID > 포인트 깎기
      await queryRunner.manager.decrement(
        User,
        { userId },
        'point',
        communityUser.community.membershipPrice,
      );
      const user = await this.userRepository.findOne({
        where: {
          userId,
        },
      });
      await queryRunner.commitTransaction();

      return {
        communityUserId: communityUser.communityUserId,
        nickname: communityUser.nickName,
        price: communityUser.community.membershipPrice,
        accountBalance: user.point,
        createdAt: membership.createdAt,
        expiresAt: membership.expiration,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllMembership(userId: number) {
    // 유저아이디, 멤버십 가입 여부 바탕으로 커뮤니티 유저 조회
    const communityUser = await this.communityUserRepository.find({
      where: {
        userId,
        membership: {
          membershipId: Not(IsNull()),
        },
      },
      relations: ['membership', 'community'],
    });
    const memberships = communityUser.map((cur) => {
      const membership = cur.membership.find((cur) => {
        return cur.deletedAt == null;
      });
      return {
        membershipId: membership.membershipId,
        group: cur.community.communityName,
        createdAt: membership.createdAt,
        expiration: membership.expiration,
      };
    });
    return memberships;
  }

  async findMembership(membershipId: number) {
    // 유저아이디, 멤버십 가입 여부 바탕으로 커뮤니티 유저 조회
    const communityUser = await this.communityUserRepository.findOne({
      where: {
        membership: {
          membershipId,
        },
      },
      relations: ['membership', 'community'],
    });
    if (_.isNil(communityUser)) {
      throw new NotFoundException({
        status: 404,
        message: '해당 멤버십 정보가 없습니다.',
      });
    }
    const membership = communityUser.membership.find((cur) => {
      return cur.deletedAt == null;
    });
    const membershipPayment = await this.membershipPaymentRepository.findOneBy({
      membershipId: membership.membershipId,
    });
    const membershipInfo = {
      communityUserId: communityUser.communityUserId,
      communityId: communityUser.community.communityId,
      membershipPaymentId: membership.membershipId,
      nickname: communityUser.nickName,
      createdAt: membership.createdAt,
      expiration: membership.expiration,
      membershipPayment,
    };

    return membershipInfo;
  }

  async extendMembership(userId: number, membershipId: number) {
    // 유저아이디, 멤버십 가입 여부 바탕으로 커뮤니티 유저 조회
    const communityUser = await this.communityUserRepository.findOne({
      where: {
        membership: {
          membershipId,
        },
      },
      relations: ['membership', 'community'],
    });
    if (_.isNil(communityUser)) {
      throw new NotFoundException({
        status: 404,
        message: '해당 멤버십 정보가 없습니다.',
      });
    }
    const membership = communityUser.membership.find((cur) => {
      return cur.deletedAt == null;
    });
    const today = new Date();
    const remaining =
      (membership.expiration.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24);

    if (remaining > 7) {
      throw new BadRequestException({
        status: 400,
        message: '멤버십 연장은 기간 만료 일주일 전부터 가능합니다.',
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ UNCOMMITTED');

    try {
      const expiration = membership.expiration;
      expiration.setFullYear(expiration.getFullYear() + 1);
      // 결제내역 저장
      const membershipPayment = this.membershipPaymentRepository.create({
        userId,
        membershipId: membership.membershipId,
        communityId: communityUser.communityId,
        price: communityUser.community.membershipPrice,
        type: MembershipPaymentType.Extension,
      });
      await queryRunner.manager.save(MembershipPayment, membershipPayment);

      // 유저ID > 포인트 깎기
      await queryRunner.manager.decrement(
        User,
        { userId },
        'point',
        communityUser.community.membershipPrice,
      );
      const user = await this.userRepository.findOne({
        where: {
          userId,
        },
      });
      await queryRunner.commitTransaction();

      return {
        communityUserId: communityUser.communityUserId,
        nickname: communityUser.nickName,
        price: communityUser.community.membershipPrice,
        accountBalance: user.point,
        createdAt: membership.createdAt,
        updatedAt: membership.updatedAt,
        expiresAt: membership.expiration,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findMembershipPayments(communityId?: number) {
    let payments;
    if (communityId) {
      payments = await this.membershipPaymentRepository.find({
        where: {
          communityId,
        },
        relations: {
          user: true,
          community: true,
        },
      });
    } else {
      payments = await this.membershipPaymentRepository.find({
        relations: {
          user: true,
          community: true,
        },
      });
    }

    return payments.map((payment) => {
      return {
        membershipPaymentId: payment.membershipPaymentId,
        userId: payment.user.userId,
        name: payment.user.name,
        email: payment.user.email,
        communityId: payment.community.communityId,
        communityName: payment.community.communityName,
        paymentType: payment.type,
        createdAt: payment.createdAt,
      };
    });
  }
}
