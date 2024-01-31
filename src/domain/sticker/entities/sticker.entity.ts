import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Animal } from '@/domain/types/enum/animal.enum';
import { Comment } from '@/domain/comments/entities/comment.entity';

@Entity({ name: 'stickers' })
export class Sticker {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // Todo: 나중에 nullable false로
  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @ManyToOne('Comment', 'stickers', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @Column({ type: 'enum', enum: Animal })
  animal: Animal;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
