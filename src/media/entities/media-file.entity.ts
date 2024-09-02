import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
import { Media } from './media.entity';

@Entity('media_files')
export class MediaFile {
  @PrimaryGeneratedColumn({ unsigned: true })
  mediaFilesId: number;

  @Column({ unsigned: true })
  mediaId: number;

  @Column({ unsigned: true })
  managerId: number;

  @Column()
  mediaFileUrl: string;

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
  
  @ManyToOne(() => Media, (media) => media.mediaFiles, { onDelete: 'CASCADE' })
  @JoinColumn({name: 'media_id'})
  media: Media;
}