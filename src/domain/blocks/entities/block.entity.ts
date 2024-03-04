import { User } from '@/domain/users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'blocks' })
export class BlockUser {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne('User', 'blockedUsers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blocked_by' })
  blockedBy: User;

  @ManyToOne('User', 'blockingUsers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blocked_user' })
  blockedUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
