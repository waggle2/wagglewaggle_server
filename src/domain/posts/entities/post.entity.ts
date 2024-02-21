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
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PollResponseDto } from '@/domain/polls/dto/poll-response.dto';

@Entity('posts')
@Index(['category', 'updatedAt'])
export class Post {
  @ApiProperty({
    description: '게시글 아이디',
    type: Number,
  })
  @Expose()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    description: '게시글 제목',
    type: String,
  })
  @Expose()
  @Column({ type: 'varchar', length: 50, nullable: false })
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    type: String,
  })
  @Expose()
  @Column({ type: 'text', nullable: false })
  content: string;

  @ApiProperty({
    description: '익명 여부',
    type: Boolean,
  })
  @Expose()
  @Column({ name: 'is_anonymous', default: true })
  isAnonymous: boolean;

  @ApiProperty({
    description: '댓글 수',
    type: Number,
  })
  @Expose()
  @Column({ name: 'comment_num', default: 0 })
  commentNum: number;

  @ApiProperty({
    description: '조회수',
    type: Number,
  })
  @Expose()
  @Column({ default: 0 })
  views: number;

  @ApiProperty({
    description: '게시글 태그',
    enum: Tag,
  })
  @Expose()
  @Column({
    name: 'tag',
    type: 'enum',
    enum: Tag,
    nullable: false,
  })
  tag: Tag;

  @ApiProperty({
    description: '게시글 이미지 링크들',
    type: [String],
  })
  @Expose()
  @Column({ type: 'json' })
  imageUrls: string[];

  @ApiProperty({
    description: '작성자의 동물',
    enum: Animal,
  })
  @Expose()
  @Column({
    name: 'animal_of_author',
    type: 'enum',
    enum: Animal,
    nullable: false,
  })
  animalOfAuthor: Animal;

  @ApiProperty({
    description: '게시글 카테고리',
    enum: Category,
  })
  @Expose()
  @Column({ type: 'enum', enum: Category, nullable: false })
  category: Category;

  @ApiProperty({
    description: '좋아요를 누른 유저 아아디 목록',
    type: [String],
  })
  @Expose()
  @Column({ type: 'simple-array', nullable: true })
  likes: string[];

  @OneToMany('Comment', 'post', {
    cascade: true,
    lazy: true,
  })
  comments: Comment[];

  @ApiProperty({
    type: () => PollResponseDto,
    description: '투표',
  })
  @Expose()
  @Type(() => PollResponseDto)
  @OneToOne('Poll', 'post', {
    cascade: true,
    eager: true,
  })
  poll: Poll;

  @ApiProperty({
    type: () => User,
    description: '게시글 작성자',
  })
  @Expose()
  @Type(() => User)
  @ManyToOne('User', 'posts', {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'author_id', referencedColumnName: 'id' })
  author: User;

  @ApiProperty({
    description: '게시글 작성일자',
    type: Date,
  })
  @Expose()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: '게시글 수정일자',
    type: Date,
  })
  @Expose()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    description: '게시글 삭제일자',
    type: Date,
  })
  @Expose()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
