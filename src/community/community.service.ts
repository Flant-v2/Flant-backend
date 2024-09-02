import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Community } from './entities/community.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityUser } from './community-user/entities/communityUser.entity';
import { CommunityAssignDto } from './dto/community-assign.dto';
import _ from 'lodash';
import { Manager } from 'src/admin/entities/manager.entity';
import { NotificationService } from './../notification/notification.service';
import { MESSAGES } from 'src/constants/message.constant';
import { isEmpty } from 'src/util/is-empty-util';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityUser)
    private readonly communityUserRepository: Repository<CommunityUser>,
    @InjectRepository(Manager)
    private readonly managerRepository: Repository<Manager>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createCommunityDto: CreateCommunityDto) {
    const createCommunity =
      await this.communityRepository.save(createCommunityDto);
    return {
      status: HttpStatus.CREATED,
      message: MESSAGES.COMMUNITY.CREATE.SUCCEED,
      data: createCommunity,
    };
  }

  async assignCommunity(
    userId: number,
    communityId: number,
    communityAssignDto: CommunityAssignDto,
  ) {
    const existedData = await this.communityUserRepository.findOne({
      where: { userId: userId, communityId: communityId },
    });
    if (existedData) {
      throw new ConflictException('이미 가입된 사용자입니다.');
    }

    const assignData = await this.communityUserRepository.save({
      userId: userId,
      communityId: communityId,
      nickName: communityAssignDto.nickName,
    });
    const assignedName = assignData.nickName;

    const findCommunity = await this.communityRepository.findOne({
      where: { communityId: communityId },
    });
    const communityName = findCommunity.communityName;

    const Data = { assignedName, communityName };

    this.notificationService.emitCardChangeEvent(userId);

    return {
      status: HttpStatus.OK,
      message: MESSAGES.COMMUNITY.ASSIGN.SUCCEED,
      data: Data,
    };
  }

  async findAll() {
    const allCommunities = await this.communityRepository.find({
      select: [
        'communityLogoImage',
        'communityName',
        'communityCoverImage',
        'communityId',
      ],
    });
    return {
      status: HttpStatus.OK,
      message: MESSAGES.COMMUNITY.FIND.SUCCEED,
      data: allCommunities,
    };
  }

  async findMy(userId: number) {
    const myCommunities = await this.communityUserRepository.find({
      where: { userId: userId },
      relations: ['community'],
    });

    const myData = myCommunities.map(
      (communityUser) => communityUser?.community,
    );

    return {
      status: HttpStatus.OK,
      message: MESSAGES.COMMUNITY.FINDMY.SUCCEED,
      data: myData,
    };
  }

  async findOne(communityId: number) {
    const existedCommunity = await this.communityRepository.findOne({
      where: { communityId: communityId },
      //relations: ['posts', 'posts.communityUser', 'posts.postImages', 'posts.communityUser.users'],
    });

    if (!existedCommunity) {
      throw new NotFoundException(MESSAGES.COMMUNITY.COMMON.NOT_FOUND);
    }

    // const processedPosts = existedCommunity.posts.map(post => {
    //   return {
    //     postId: post.postId,
    //     nickname: post.communityUser.nickName,
    //     profileImage: post.communityUser.users.profileImage,
    //     isArtist: post.artistId !== null, // artistId가 존재하면 아티스트로 간주
    //     content: post.content,
    //     createdAt: post.createdAt,
    //     updatedAt: post.updatedAt,
    //     postImages: post.postImages.map(image => ({
    //       postImageId: image.postImageId,
    //       postImageUrl: image.postImageUrl,
    //     })),
    //   };
    // });

    // 필요한 커뮤니티 정보와 가공된 posts 데이터를 함께 반환
    return {
      status: HttpStatus.OK,
      message: MESSAGES.COMMUNITY.FINDONE.SUCCEED,
      data: {
        communityId: existedCommunity.communityId,
        communityName: existedCommunity.communityName,
        communityLogoImage: existedCommunity.communityLogoImage,
        communityCoverImage: existedCommunity.communityCoverImage,
        membershipPrice: existedCommunity.membershipPrice,
        createdAt: existedCommunity.createdAt,
        updatedAt: existedCommunity.updatedAt,
        deletedAt: existedCommunity.deletedAt,
        //posts: processedPosts, // 가공된 posts 배열
      },
    };
  }

  async updateCommunity(
    communityId: number,
    updateCommunityDto: UpdateCommunityDto,
  ) {
    //입력된 수정 사항이 없을 경우
    if (_.isEmpty(updateCommunityDto)) {
      throw new BadRequestException(MESSAGES.COMMUNITY.UPDATE.REQUIRED);
    }

    //수정된 사항만 반영
    const existedCommunity = await this.communityRepository.findOne({
      where: { communityId: communityId },
    });

    if (!existedCommunity) {
      throw new NotFoundException(MESSAGES.COMMUNITY.COMMON.NOT_FOUND);
    }

    // 업데이트 데이터 필터링
    const updateData = {};
    for (const key in updateCommunityDto) {
      if (
        !isEmpty(updateCommunityDto) &&
        existedCommunity[key] !== updateCommunityDto[key]
      ) {
        updateData[key] = updateCommunityDto[key];
      }
    }

    //수정 진행
    if (!_.isEmpty(updateData)) {
      await this.communityRepository.update({ communityId }, updateData);
    }

    return {
      status: HttpStatus.ACCEPTED,
      message: MESSAGES.COMMUNITY.UPDATE.SUCCEED,
      data: { ...existedCommunity, ...updateData },
    };
  }

  async removeCommunity(communityId: number) {
    await this.communityRepository.delete(communityId);

    return {
      status: HttpStatus.OK,
      message: MESSAGES.COMMUNITY.REMOVE.SUCCEED,
      data: communityId,
    };
  }

  async updateLogo(communityId: number, imageUrl: string) {
    //등록할 이미지가 없는 경우
    if (!imageUrl) {
      throw new BadRequestException(MESSAGES.COMMUNITY.UPDATELOGO.BAD_REQUEST);
    }

    await this.communityRepository.update(
      { communityId: communityId },
      { communityLogoImage: imageUrl },
    );

    const updatedData = await this.communityRepository.findOne({
      where: { communityId: communityId },
      select: { communityName: true, communityLogoImage: true },
    });

    return {
      status: HttpStatus.ACCEPTED,
      message: MESSAGES.COMMUNITY.UPDATELOGO.SUCCEED,
      data: updatedData,
    };
  }

  async updateCover(communityId: number, imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException(MESSAGES.COMMUNITY.UPDATECOVER.BAD_REQUEST);
    }
    await this.communityRepository.update(
      { communityId: communityId },
      { communityCoverImage: imageUrl },
    );
    const updatedData = await this.communityRepository.findOne({
      where: { communityId: communityId },
      select: { communityName: true, communityCoverImage: true },
    });

    return {
      status: HttpStatus.ACCEPTED,
      message: MESSAGES.COMMUNITY.UPDATECOVER.SUCCEED,
      data: updatedData,
    };
  }
}
