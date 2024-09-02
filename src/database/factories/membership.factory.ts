import { Membership } from 'src/membership/entities/membership.entity';
import { setSeederFactory } from 'typeorm-extension';

setSeederFactory(Membership, (faker) => {
  const membership = new Membership();

  return membership;
});