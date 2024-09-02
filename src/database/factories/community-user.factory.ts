import { setSeederFactory } from 'typeorm-extension';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';

setSeederFactory(CommunityUser, (faker) => {
  const communityUser = new CommunityUser();
  communityUser.nickName = faker.internet.userName();
  //communityUser.communityId = faker.helpers.arrayElement([15, 16]);

  return communityUser;
});
