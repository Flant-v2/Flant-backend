import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityUser } from './entities/communityUser.entity';
import { Reflector } from '@nestjs/core';
import { User } from 'src/user/entities/user.entity';
import { Community } from '../entities/community.entity';
import { MESSAGES } from 'src/constants/message.constant';

@Injectable()
export class CommunityUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityUser)
    private readonly communityUserRepository: Repository<CommunityUser>,
  ) {}

  async findByCommunityIdAndUserId(communityId: number, userId: number) {
    const existedUser = await this.userRepository.findOne({
      where: { userId },
    });
    if (!existedUser) {
      throw new NotFoundException(MESSAGES.USER.COMMON.NOT_FOUND);
    }

    const existedCommunity = await this.communityRepository.findOne({
      where: { communityId },
    });
    if (!existedCommunity) {
      throw new NotFoundException(MESSAGES.COMMUNITY.COMMON.NOT_FOUND);
    }

    const existedCommunityUser = await this.communityUserRepository.findOne({
      where: {
        userId,
        communityId,
      },
    });

    if (!existedCommunityUser) {
      throw new NotFoundException(MESSAGES.COMMUNITY_USER.COMMON.NOT_FOUND);
    }

    return existedCommunityUser;
  }

  async findByCommunityUser(communityId: number, userId: number) {
    const existedUser = await this.userRepository.findOne({
      where: { userId },
    });
    if (!existedUser) {
      throw new NotFoundException(MESSAGES.USER.COMMON.NOT_FOUND);
    }

    const existedCommunity = await this.communityRepository.findOne({
      where: { communityId },
    });
    if (!existedCommunity) {
      throw new NotFoundException(MESSAGES.COMMUNITY.COMMON.NOT_FOUND);
    }

    const existedCommunityUser = await this.communityUserRepository.findOne({
      where: {
        userId,
        communityId,
      },
    });

    // if (!existedCommunityUser) {
    //   throw new NotFoundException(MESSAGES.COMMUNITY_USER.COMMON.NOT_FOUND);
    // }

    return existedCommunityUser;
  }
}
