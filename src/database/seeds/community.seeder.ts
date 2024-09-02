import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Community } from 'src/community/entities/community.entity';
export default class CommunitySeeder implements Seeder {
  async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(Community);
    await repository.insert([
      {
        communityName: 'group1',
        membershipPrice: 20000,
      },
      {
        communityName: 'group2',
        membershipPrice: 20000,
      },
    ]);
  }
}
