import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApplyUser } from './apply-user.entity';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Manager } from 'src/admin/entities/manager.entity';
import { Community } from 'src/community/entities/community.entity';
import { FormType } from '../types/form-type.enum';
import { FormQuestion } from './form-question.entity';

@Entity('form')
export class Form {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({unsigned: true})
  managerId: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @IsEnum({
    type: 'enum',
    enum: FormType,
  })
  @Column()
  formType: FormType;

  @Column()
  maxApply: number;

  @Column()
  spareApply: number;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  //apply_user 연결
  @OneToMany(() => ApplyUser, (applyUser) => applyUser.form)
  applyUser: ApplyUser[];

  //form_question 연결
  @OneToMany(() => FormQuestion, (formQuestion) => formQuestion.form)
  formQuestion: FormQuestion[];

  // 매니저 연결
  @ManyToOne(() => Manager, (manager) => manager.form, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'manager_id' })
  manager: Manager;

  //커뮤니티 연결
  @ManyToOne(() => Community, (community) => community.form, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'community_id' })
  community: Community;
}
