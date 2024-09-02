import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Community } from 'src/community/entities/community.entity';
import { Artist } from 'src/admin/entities/artist.entity';

@Entity('lives')
export class Live {
  @PrimaryGeneratedColumn({ unsigned: true })
  liveId: number;

  /**
   *  커뮤니티 ID
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  @Column({ type: 'int', unsigned: true })
  communityId: number;

  @Column({ type: 'int', unsigned: true })
  artistId: number;

  /**
   *  라이브 제목
   * @example "라이브 방송 테스트"
   */
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @IsString()
  @IsNotEmpty()
  @Column({ default: 'https://img.freepik.com/free-photo/grunge-black-concrete-textured-background_53876-124541.jpg', nullable: true })
  thumbnailImage: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  streamKey: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  liveVideoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Community, (community) => community.live)
  @JoinColumn({name: 'community_id'})
  community: Community;

  @ManyToOne(() => Artist, (artist) => artist.live)
  @JoinColumn({name: 'artist_id'})
  artist: Artist;
}
