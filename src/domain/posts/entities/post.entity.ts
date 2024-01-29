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
  Index,
} from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { Category } from '@/domain/categories/entities/category.entity';
import { Tag } from '@/domain/types/enum/tags.enum';
import { Poll } from '@/domain/polls/entities/poll.entity';
import { Animal } from '@/domain/types/enum/animal.enum';

@Entity()
@Index(['updatedAt', 'commentNum', 'likeNum'])
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ name: 'is_anonymous' })
  isAnonymous: boolean;

  @Column({ name: 'comment_num', default: 0 })
  commentNum: number;

  @Column({ name: 'like_num', default: 0 })
  likeNum: number;

  @Column({
    type: 'json',
    nullable: true,
  })
  tags: Tag[];

  @Column({ type: 'json', nullable: true })
  imageUrls: string[];

  // Todo: 나중에 nullable false
  @Column({ name: 'animal', type: 'enum', enum: Animal, nullable: true })
  animal: Animal;

  @Column({ name: 'preferred_response_animal', type: 'enum', enum: Animal })
  preferredResponseAnimal: Animal;

  @Column({ type: 'json', nullable: true })
  likes: number[]; // 좋아요 누른 유저 아이디

  @OneToMany('Comment', 'post', {
    cascade: true,
    lazy: true,
  })
  comments: Comment[];

  @OneToOne('Poll', 'post', {
    cascade: true,
    eager: true,
  })
  poll: Poll | null;

  @ManyToOne('Category', 'posts')
  category: Category;

  // Todo
  // user: User

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
