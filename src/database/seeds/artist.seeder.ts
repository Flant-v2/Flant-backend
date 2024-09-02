import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { Community } from 'src/community/entities/community.entity';
import { User } from 'src/user/entities/user.entity';
import { Artist } from 'src/admin/entities/artist.entity';
import { UserRole } from 'src/user/types/user-role.type';

export default class ArtistSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const Factory = factoryManager.get(Artist);
    const communityRepository = dataSource.getRepository(Community);
    const communities = await communityRepository.find();
    const communityId = communities.map((i) => i.communityId);
    const communityUserRepository = dataSource.getRepository(CommunityUser);
    const communityUsers = await communityUserRepository.find({
      where: {
        users: {
          role: UserRole.User,
        },
      },
      take: 4,
    });
    const communityUserId = communityUsers.map((i) => i.communityUserId);

    for (let i = 0; i < communityUsers.length; i++) {
      try {
        await Factory.save({
          communityUserId: communityUserId[i],
          communityId: communityId[i % communityId.length],
        });
      } catch (e) {
        i--;
        continue;
      }
    }
  }
}
