import { hash } from 'bcrypt';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../user/types/user-role.type';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ConfigService } from '@nestjs/config';
export default class AdminSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(User);
    const configService = new ConfigService();
    const hashRound = parseInt(configService.get('PASSWORD_HASH'));
    await repository.insert([
      {
        name: 'admin',
        email: configService.get('ADMIN_EMAIL'),
        password: await hash(configService.get('ADMIN_PASSWORD'), hashRound),
        role: UserRole.Admin,
        profileImage: 'sparta.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);
    console.log("--------------------------")
  }
}
