import { hash } from 'bcrypt';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../user/types/user-role.type';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ConfigService } from '@nestjs/config';
import { Manager } from 'src/admin/entities/manager.entity';
import { Community } from 'src/community/entities/community.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
export default class ManagerSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(Manager);
    const communityRepository = dataSource.getRepository(Community);
    const communities = await communityRepository.find();
    const communityId = communities.map((i) => i.communityId);
    const communityUserRepository = dataSource.getRepository(CommunityUser);
    const communityUsers = await communityUserRepository.find({
      where: {
        users: {
          role: UserRole.Manager,
        },
      },
    });
    const communityUserId = communityUsers.map((i) => i.communityUserId);

    const configService = new ConfigService();
    const hashRound = parseInt(configService.get('PASSWORD_HASH'));
    await repository.insert([
      {
        communityUserId: communityUserId[0],
        communityId: communityId[0],
        managerNickname: 'manager1',
      },
      {
        communityUserId: communityUserId[1],
        communityId: communityId[1],
        managerNickname: 'manager2',
      },
    ]);
  }
}
