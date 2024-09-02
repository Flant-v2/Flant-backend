import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { User } from 'src/user/entities/user.entity';
import { Membership } from 'src/membership/entities/membership.entity';
import { UserRole } from 'src/user/types/user-role.type';

export default class MembershipSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const Factory = factoryManager.get(Membership);
    const communityUserRepository = dataSource.getRepository(CommunityUser);
    const communityUser = await communityUserRepository.find({
      where: {
        users: {
          role: UserRole.User,
        },
      },
    });
    const communityUserId = communityUser.map((i) => i.communityUserId);

    for (let i = 0; i < communityUser.length/2; i++) {
      try {
        const expiration = new Date();
        expiration.setFullYear(expiration.getFullYear() + 1); // 배포용
        expiration.setHours(9);
        expiration.setMilliseconds(0);
        expiration.setSeconds(0);
        expiration.setMinutes(0);

        await Factory.save({
          communityUserId: communityUserId[i],
          expiration,
        });
      } catch (e) {
        i--;
        continue;
      }
    }
  }
}
