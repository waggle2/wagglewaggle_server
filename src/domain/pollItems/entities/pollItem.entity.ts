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

@Entity('poll_items')
export class PollItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  content: string;

  @ManyToOne('Poll', 'pollItems', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id', referencedColumnName: 'id' })
  poll: Poll;

  @Column({ name: 'user_ids', type: 'json' })
  userIds: string[] = [];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
