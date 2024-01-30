import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '@/domain/posts/entities/post.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  content: string;

  @Column({ name: 'is_anonymous' })
  isAnonymous: boolean;

  @ManyToOne('Post', 'comments', {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne('Comment', 'replies', {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'comment_id' })
  parent: Comment | null;

  @OneToMany('Comment', 'parent', {
    cascade: true,
    eager: true,
  })
  replies: Comment[];

  // Todo
  // user: User;
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
