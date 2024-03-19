import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '@/domain/posts/entities/post.entity';
import { PollItem } from '@/domain/polls/entities/pollItem.entity';

@Entity('polls')
export class Poll {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  title: string;

  @Column({ name: 'ended_at' })
  endedAt: Date;

  @OneToOne('Post', 'poll', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: Post;

  @OneToMany('PollItem', 'poll', {
    cascade: true,
    eager: true,
  })
  pollItems: PollItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
