import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Form } from './form.entity';
import { ApplyType } from '../types/form-apply-type.enum';

@Entity('apply_user')
export class ApplyUser {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({unsigned: true})
  userId: number;

  @Column()
  question: string;

  @Column({ type: 'enum', enum: ApplyType })
  applyType: ApplyType;

  // form 연결
  @ManyToOne(() => Form, (form) => form.applyUser, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'form_id' })
  form: Form;
}
