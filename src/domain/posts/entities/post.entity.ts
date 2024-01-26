import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { Category } from '@/domain/categories/entities/category.entity';
import { Tag } from '@/domain/types/enum/tags.enum';
import { Poll } from '@/domain/polls/entities/poll.entity';
import { Animal } from '@/domain/types/enum/animal.enum';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ name: 'is_anonymous' })
  isAnonymous: boolean;

  @Column('simple-array', {
    nullable: true,
  })
  tags: Tag[];

  @Column({ type: 'json' })
  images: string[];

  @Column({ name: 'author_animal', type: 'enum', enum: Animal })
  animal: Animal;

  @Column({ type: 'json' })
  likes: number[]; // 좋아요 누른 유저 아이디

  @OneToMany('Comment', 'post', {
    lazy: true,
  })
  comments: Comment[];

  @OneToOne('Poll', 'post', {
    cascade: true,
    eager: true,
  })
  poll: Poll | null;

  @ManyToOne('Category', 'posts', {
    onDelete: 'NO ACTION',
  })
  category: Category;

  // Todo
  // user: User

  // stickers: Stickers

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
