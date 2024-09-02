import { Artist } from 'src/admin/entities/artist.entity';
import { setSeederFactory } from 'typeorm-extension';

setSeederFactory(Artist, (faker) => {
  const artist = new Artist();
  artist.artistNickname = faker.internet.userName();

  return artist;
});
