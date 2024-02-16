import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@/@types/enum/category.enum';
import { Animal } from '@/@types/enum/animal.enum';
import { Tag } from '@/@types/enum/tags.enum';
import { Post } from '@/domain/posts/entities/post.entity';

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

  @ApiProperty({ description: '태그', type: Tag })
  @IsEnum(Tag)
  @Expose()
  tag: Tag;

  @ApiProperty({ description: '이미지 URL 배열', type: [String] })
  @Expose()
  imageUrls: string[];

  @ApiProperty({ description: '게시자의 동물', enum: Animal })
  @IsEnum(Animal)
  @Expose()
  animalOfAuthor: Animal;

  @ApiProperty({ description: '게시물 작성자 닉네임', type: String })
  @IsString()
  @Expose()
  nicknameOfAuthor: string;

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

  @ApiProperty({ description: '게시물 작성일', type: Date })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '게시물 수정일', type: Date })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: '게시물 삭제일', type: Date, required: false })
  @Expose()
  deletedAt?: Date;

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.content = post.content;
    this.isAnonymous = post.isAnonymous;
    this.commentNum = post.commentNum;
    this.views = post.views;
    this.tag = post.tag;
    this.imageUrls = post.imageUrls;
    this.animalOfAuthor = post.author.profileAnimal; // Assuming author's profileAnimal represents the animal of the author
    this.category = post.category;
    this.likes = post.likes;
    this.createdAt = post.createdAt;
    this.updatedAt = post.updatedAt;
    this.deletedAt = post.deletedAt;
    this.nicknameOfAuthor = post.author.credential.nickname; // Assuming the author's nickname is available
  }
}
