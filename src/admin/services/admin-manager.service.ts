import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Manager } from '../entities/manager.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Community } from './../../community/entities/community.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { CommunityUserRole } from 'src/community/community-user/types/community-user-role.type';
import { MESSAGES } from 'src/constants/message.constant';
import { CreateManagerDto } from '../dto/create-manager.dto';
import { UserRole } from 'src/user/types/user-role.type';
@Injectable()
export class AdminManagerService {
  constructor(
    @InjectRepository(Manager)
    private readonly managerRepository: Repository<Manager>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityUser)
    private readonly communityUserRepository: Repository<CommunityUser>,
  ) {}

  // 매니저 생성
  async createManager(createManagerDto: CreateManagerDto) {
    const { communityId, userId, managerNickname } = createManagerDto;

    //만약 해당 커뮤니티가 없다면 false반환
    const existedCommunity = await this.communityRepository.findOneBy({
      communityId,
    });
    if (!existedCommunity)
      throw new NotFoundException(MESSAGES.COMMUNITY.COMMON.NOT_FOUND);

    //만약 해당 유저가 없다면 false 반환
    const existedUser = await this.userRepository.findOneBy({
      userId,
    });
    if (!existedUser)
      throw new NotFoundException(MESSAGES.USER.COMMON.NOT_FOUND);

    // 매니저가 해당 그룹의 커뮤니티 가입
    const managerCommunityUser = await this.communityUserRepository.save({
      userId,
      communityId,
      nickName: managerNickname,
    });
    const communityUserId = managerCommunityUser.communityUserId;

    //이미 user_id로 가입된 매니저라면 false반환
    const exsitedManager = await this.managerRepository.findOneBy({
      communityUserId,
    });
    if (exsitedManager)
      throw new ConflictException(MESSAGES.MANAGER.COMMON.DUPLICATED);

    const manager = await this.managerRepository.save({
      communityId,
      communityUserId,
      managerNickname,
    });

    return manager;
  }

  // 매니저 삭제
  async deleteManager(managerId: number) {
    // 해당 매니저 아이디가 없다면 false 반환
    const existedManagewr = await this.managerRepository.findOneBy({
      managerId,
    });
    if (!existedManagewr)
      throw new NotFoundException(MESSAGES.MANAGER.COMMON.NOT_FOUND);

    // 해당 매니저 삭제 로직
    await this.managerRepository.delete({ managerId });
    await this.communityUserRepository.delete({
      communityUserId: existedManagewr.communityUserId,
    });

    return true;
  }

  async findByCommunityUserId(communityUserId: number) {
    const existedManager = await this.managerRepository.findOne({
      where: {
        communityUserId,
      },
    });

    if (!existedManager)
      throw new NotFoundException(MESSAGES.MANAGER.COMMON.NOT_FOUND);

    return {
      roleId: existedManager.managerId,
      role: CommunityUserRole.MANAGER,
    };
  }
}
