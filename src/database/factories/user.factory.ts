import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../user/entities/user.entity';
import { UserRole } from 'src/user/types/user-role.type';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();
const hashRounds = Number(process.env.PASSWORD_HASH);
const password = process.env.ADMIN_PASSWORD;
setSeederFactory(User, (faker) => {
  const user = new User();
  user.name = faker.internet.userName();
  user.email = faker.internet.email();
  user.password = bcrypt.hashSync(password, hashRounds);
  user.profileImage = faker.image.url();
  user.role = UserRole.User;

  return user;
});
