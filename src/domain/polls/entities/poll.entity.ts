import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '@/domain/posts/entities/post.entity';
import { PollItem } from '@/domain/pollItems/entities/pollItem.entity';

@Entity()
export class Poll {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column({
    name: 'is_end',
    default: false,
  })
  isEnd: boolean;

  @Column({
    name: 'is_anonymous',
    default: true,
  })
  isAnonymous: boolean;

  @Column({ name: 'allow_multiple_choices', default: true })
  allowMultipleChoices: boolean;

  @Column({ name: 'ended_at' })
  endedAt: Date;

  @OneToOne('Post', 'poll', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @OneToMany('PollItem', 'poll', {
    cascade: true,
    eager: true,
  })
  pollItems: PollItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
