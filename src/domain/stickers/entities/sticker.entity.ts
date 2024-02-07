import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Animal } from '@/@types/enum/animal.enum';
import { Comment } from '@/domain/comments/entities/comment.entity';

@Entity({ name: 'stickers' })
export class Sticker {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne('Comment', 'stickers', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @Index()
  @Column({ type: 'enum', enum: Animal, nullable: false })
  animal: Animal;
}
