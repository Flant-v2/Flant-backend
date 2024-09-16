import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReportTypes } from '../types/report.types';

export class Report {
  @PrimaryGeneratedColumn({ unsigned: true })
  reportId: number;

  @Column({ unsigned: true })
  communityUserId: number;

  @Column({ unsigned: true })
  postId: number;

  @Column({ unsigned: true })
  commentId: number;

  @IsNumber()
  @Column()
  totalPrice: number;

  @Column({ type: 'enum', enum: ReportTypes, default: 'DisallowedActivities' })
  progress: ReportTypes;

  @Column({ unsigned: true })
  content: string;

  @Column({ unsigned: true })
  isValidReport: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
