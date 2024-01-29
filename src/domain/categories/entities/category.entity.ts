import { Post } from '@/domain/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @OneToMany('Post', 'category', {
    cascade: true,
    lazy: true,
  })
  posts: Post[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
