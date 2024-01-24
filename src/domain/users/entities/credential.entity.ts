import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Gender } from '@/domain/types/enum/users.enum';

@Entity({ name: 'credentials' })
export class Credential {
  @OneToOne('User', 'credential', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @PrimaryColumn({ type: 'int' })
  user: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column({ name: 'birth_year' })
  birthYear: number;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;
}
