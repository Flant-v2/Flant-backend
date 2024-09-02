import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Form } from './form.entity';

@Entity('form_question')
export class FormQuestion {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  question: string;

  // Form 연결
  @ManyToOne(() => Form, (form) => form.formQuestion, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'form_id' })
  form: Form;
}
