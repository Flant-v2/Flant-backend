import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Notice } from './notice.entity';
  
  @Entity('notice_images')
  export class NoticeImage {
    @PrimaryGeneratedColumn({ unsigned: true })
    postImageId: number;
  
    @Column({ unsigned: true })
    noticeId: number;

    @Column({ unsigned: true })
    managerId: number;
  
    @Column()
    noticeImageUrl: string;
    
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @ManyToOne(() => Notice, (notice) => notice.noticeImages, { onDelete: 'CASCADE'})
    @JoinColumn({name: 'notice_id'})
    notice: Notice;
  }