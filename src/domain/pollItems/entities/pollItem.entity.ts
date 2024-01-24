import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Poll } from '@/domain/polls/entities/poll.entity';

@Entity()
export class PollItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  content: string;

  @ManyToOne('Poll', 'pollItems', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  // users: User[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
