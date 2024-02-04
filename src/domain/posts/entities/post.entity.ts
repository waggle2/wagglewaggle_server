import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { Tag } from '@/@types/enum/tags.enum';
import { Poll } from '@/domain/polls/entities/poll.entity';
import { Animal } from '@/@types/enum/animal.enum';
import { Like } from '@/domain/likes/entities/like.entity';
import { Category } from '@/@types/enum/category.enum';

@Entity()
@Index(['category', 'updatedAt'])
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

  @Column({ default: 0 })
  views: number;

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

  @Column({ type: 'enum', enum: Category, nullable: false })
  category: Category;

  @OneToMany('Like', 'post', {
    cascade: true,
  })
  likes: Like[];

  @OneToMany('Comment', 'post', {
    cascade: true,
    lazy: true,
  })
  comments: Comment[];

  @OneToOne('Poll', 'post', {
    cascade: true,
    nullable: true,
    eager: true,
  })
  poll: Poll | null;

  // Todo
  // user: User

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
