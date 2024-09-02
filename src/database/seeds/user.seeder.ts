import { DataSource } from 'typeorm'
import { Seeder, SeederFactoryManager } from 'typeorm-extension'
import { User } from '../../user/entities/user.entity'
import { UserRole } from 'src/user/types/user-role.type'

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const Factory = factoryManager.get(User)
    for (let i=0; i<2; i++) {
      try {
        await Factory.save({
          role: UserRole.Manager,
        })
      } catch (e) {
        i--
        continue
      }
    }
    for (let i = 0; i < 200; i++) {
      try {
        await Factory.save({})
      } catch (e) {
        i--
        continue
      }
    }
  }
}