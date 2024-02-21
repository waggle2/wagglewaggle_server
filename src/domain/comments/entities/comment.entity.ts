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
  Index,
} from 'typeorm';
import { Post } from '@/domain/posts/entities/post.entity';
import { Sticker } from '@/domain/stickers/entities/sticker.entity';
import { User } from '@/domain/users/entities/user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ name: 'is_anonymous', default: true })
  isAnonymous: boolean;

  @ManyToOne('Post', 'comments', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne('Comment', 'replies', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  parent: Comment;

  @OneToMany('Comment', 'parent', {
    cascade: true,
    eager: true,
  })
  replies: Comment[];

  @OneToMany('Sticker', 'comment', {
    cascade: true,
  })
  stickers: Sticker[];

  @ManyToOne('User', 'comments', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author', referencedColumnName: 'id' })
  author: User;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
