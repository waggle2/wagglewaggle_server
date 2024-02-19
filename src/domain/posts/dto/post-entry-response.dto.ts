import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Category } from '@/@types/enum/category.enum';
import { Animal } from '@/@types/enum/animal.enum';
import { Tag } from '@/@types/enum/tags.enum';
import { Post } from '@/domain/posts/entities/post.entity';
import { User } from '@/domain/users/entities/user.entity';

@ApiExtraModels()
export class PostEntryResponseDto {
  @ApiProperty({ description: '게시물 ID', type: Number })
  @IsNumber()
  @Expose()
  id: number;

  @ApiProperty({ description: '게시물 제목', type: String })
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({ description: '게시물 내용', type: String })
  @IsString()
  @Expose()
  content: string;

  @ApiProperty({ description: '익명 여부', type: Boolean })
  @IsBoolean()
  @Expose()
  isAnonymous: boolean;

  @ApiProperty({ description: '댓글 수', type: Number })
  @Expose()
  commentNum: number;

  @ApiProperty({ description: '조회수', type: Number })
  @Expose()
  views: number;

  @ApiProperty({
    description: '게시글 이미지 링크들',
    type: String,
    isArray: true,
  })
  @Expose()
  imageUrls: string[];

  @ApiProperty({ description: '태그', enum: Tag })
  @IsEnum(Tag)
  @Expose()
  tag: Tag;

  @ApiProperty({ description: '작성 당시 유저의 동물', enum: Animal })
  @IsEnum(Animal)
  @Expose()
  animalOfAuthor: Animal;

  @ApiProperty({ description: '작성자', type: User })
  @Expose()
  author: User;

  @ApiProperty({ description: '카테고리', enum: Category })
  @IsEnum(Category)
  @Expose()
  category: Category;

  @ApiProperty({
    description: '좋아요를 누른 유저 ID 목록',
    type: [String],
    required: false,
  })
  @Expose()
  likes: string[];

  @ApiProperty({ description: '게시물 작성일자', type: Date })
  @Expose()
  createdAt: Date;

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.content = post.content;
    this.isAnonymous = post.isAnonymous;
    this.commentNum = post.commentNum;
    this.views = post.views;
    this.imageUrls = post.imageUrls;
    this.tag = post.tag;
    this.animalOfAuthor = post.animalOfAuthor;
    this.category = post.category;
    this.likes = post.likes;
    this.createdAt = post.createdAt;
    this.author = post.author;
  }
}
