import { IsNotEmpty, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('refreshtoken')
export class Refreshtoken {
  @PrimaryGeneratedColumn({ unsigned: true })
  refreshTokenId: number;

  /**
   * 유저 ID
   * @example"1"
   */
  @IsNotEmpty({ message: `유저 ID 입력해 주세요.` })
  @IsString()
  @Column({unsigned: true})
  userId: number;
  /**
   * 액세스 토큰값
   * @example "ejy~"
   */
  @IsNotEmpty({ message: `토큰을 입력해 주세요.` })
  @Column()
  accesstoken: string;

  /**
   * 액세스 토큰값
   * @example "ejy~"
   */
  @IsNotEmpty({ message: `리프레쉬 토큰을 입력해 주세요.` })
  @Column()
  refreshtoken: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  expiresAt: Date;

  @OneToOne(() => User, (user) => user.refreshtoken, {
    cascade: true,
  })
  user: User;
}
