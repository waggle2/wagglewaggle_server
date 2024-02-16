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
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { Tag } from '@/@types/enum/tags.enum';
import { Poll } from '@/domain/polls/entities/poll.entity';
import { Animal } from '@/@types/enum/animal.enum';
import { Category } from '@/@types/enum/category.enum';
import { User } from '@/domain/users/entities/user.entity';

@Entity('posts')
@Index(['category', 'updatedAt'])
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  content: string;

  @Column({ name: 'is_anonymous', default: true })
  isAnonymous: boolean;

  @Column({ name: 'comment_num', default: 0 })
  commentNum: number;

  @Column({ default: 0 })
  views: number;

  @Column({
    name: 'tag',
    type: 'enum',
    enum: Tag,
    nullable: false,
  })
  tag: Tag;

  @Column({ type: 'json' })
  imageUrls: string[];

  @Column({
    name: 'animal_of_author',
    type: 'enum',
    enum: Animal,
    nullable: false,
  })
  animalOfAuthor: Animal;

  @Column({ type: 'enum', enum: Category, nullable: false })
  category: Category;

  @Column({ type: 'simple-array', nullable: true })
  likes: string[];

  @OneToMany('Comment', 'post', {
    cascade: true,
    lazy: true,
  })
  comments: Comment[];

  @OneToOne('Poll', 'post', {
    cascade: true,
    eager: true,
  })
  poll: Poll;

  @ManyToOne('User', 'posts', {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'author_id', referencedColumnName: 'id' })
  author: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
