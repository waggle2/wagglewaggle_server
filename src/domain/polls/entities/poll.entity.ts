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

@Entity('polls')
export class Poll {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({
    name: 'is_end',
    default: false,
  })
  isEnd: boolean; // 투표가 종료되었는지 여부

  @Column({
    name: 'is_anonymous',
    default: true,
  })
  isAnonymous: boolean;

  @Column({ name: 'allow_multiple_choices', default: false })
  allowMultipleChoices: boolean;

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

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
