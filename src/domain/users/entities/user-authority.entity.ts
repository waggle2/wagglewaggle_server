import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthorityName } from '@/@types/enum/user.enum';
import { User } from './user.entity';

@Entity({ name: 'user_authorities' })
export class UserAuthority {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User', 'authorities', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'authority_name',
    type: 'enum',
    enum: AuthorityName,
    default: AuthorityName.USER,
  })
  authorityName: AuthorityName;
}
