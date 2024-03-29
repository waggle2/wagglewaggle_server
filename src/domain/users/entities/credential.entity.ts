import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gender } from '@/@types/enum/user.enum';
import { User } from './user.entity';

@Entity({ name: 'credentials' })
export class Credential {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne('User', 'credential', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true, unique: true })
  email: string | null;

  @Column({ nullable: true })
  password: string | null;

  @Column({ unique: true })
  nickname: string;

  @Column({ name: 'birth_year' })
  birthYear: number;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;
}
