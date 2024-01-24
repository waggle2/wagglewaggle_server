import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Post } from '@/domain/posts/entities/post.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  content: string;

  @ManyToOne('Post', 'comments', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  // Todo
  // user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
