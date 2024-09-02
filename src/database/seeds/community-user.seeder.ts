import { DataSource, Not } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { Community } from 'src/community/entities/community.entity';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user/types/user-role.type';

export default class CommunityUserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const Factory = factoryManager.get(CommunityUser);
    const communityRepository = dataSource.getRepository(Community);
    const userRepository = dataSource.getRepository(User);
    const communities = await communityRepository.find();
    const communityId = communities.map((i) => i.communityId);
    const users = await userRepository.find({
      where: {
        role: Not(UserRole.Admin)
      },
    });
    const userId = users.map((i) => i.userId);

    for (let i = 0; i < users.length; i++) {
      try {
        await Factory.save({
          userId: userId[i],
          communityId: communityId[i % communityId.length],
        });
      } catch (e) {
        i--;
        continue;
      }
    }
  }
}
