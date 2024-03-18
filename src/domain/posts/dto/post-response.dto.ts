import { Tag } from '@/@types/enum/tags.enum';
import { Animal } from '@/@types/enum/animal.enum';
import { Category } from '@/@types/enum/category.enum';
import { UserProfileDto } from '@/domain/users/dto/user-profile.dto';
import { PollResponseDto } from '@/domain/polls/dto/poll-response.dto';
import { Post } from '@/domain/posts/entities/post.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty({
    description: '게시글 아이디',
    type: Number,
  })
  readonly id: number;

  @ApiProperty({
    description: '게시글 제목',
    type: String,
  })
  readonly title: string;

  @ApiProperty({
    description: '게시글 내용',
    type: String,
  })
  readonly content: string;

  @ApiProperty({
    description: '익명 여부',
    type: Boolean,
  })
  readonly isAnonymous: boolean;

  @ApiProperty({
    description: '댓글 수',
    type: Number,
  })
  readonly commentNum: number;

  @ApiProperty({
    description: '조회수',
    type: Number,
  })
  readonly views: number;

  @ApiProperty({
    description: '태그',
    enum: Tag,
  })
  readonly tag: Tag;

  @ApiProperty({
    description: '게시글 이미지 링크들',
    type: [String],
  })
  readonly imageUrls: string[];

  @ApiProperty({
    description: '게시글 작성자의 동물',
    enum: Animal,
  })
  readonly animalOfAuthor: Animal;

  @ApiProperty({
    description: '게시글 카테고리',
    enum: Category,
  })
  readonly category: Category;

  @ApiProperty({
    description: '좋아요 유저 목록',
    type: [String],
  })
  readonly likes: string[];

  @ApiProperty({
    description: '게시글 생성일자',
    type: Date,
  })
  readonly createdAt: Date;

  @ApiProperty({
    description: '게시글 수정일자',
    type: Date,
  })
  readonly updatedAt: Date;

  @ApiProperty({
    description: '게시글 삭제일자',
    type: Date,
  })
  readonly deletedAt: Date;

  @ApiProperty({
    description: '게시글 작성자',
    type: UserProfileDto,
  })
  readonly author: UserProfileDto;

  @ApiProperty({
    description: '투표',
    type: PollResponseDto,
  })
  readonly poll: PollResponseDto;

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.content = post.content;
    this.isAnonymous = post.isAnonymous;
    this.commentNum = post.commentNum;
    this.views = post.views;
    this.tag = post.tag;
    this.imageUrls = post.imageUrls;
    this.animalOfAuthor = post.animalOfAuthor;
    this.category = post.category;
    this.likes = post.likes;
    this.createdAt = post.createdAt;
    this.updatedAt = post.updatedAt;
    this.deletedAt = post.deletedAt;
    this.author = new UserProfileDto(post.author);
    this.poll = post.poll ? new PollResponseDto(post.poll, post.id) : null;
  }
}
