import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '@/domain/posts/entities/post.entity';

@Entity({ name: 'likes' })
export class Like {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // Todo
  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @ManyToOne('Post', 'likes')
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
