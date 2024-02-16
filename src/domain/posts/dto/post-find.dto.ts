import { Tag } from '@/@types/enum/tags.enum';
import { Category } from '@/@types/enum/category.enum';
import { Animal } from '@/@types/enum/animal.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class PostFindDto {
  @ApiProperty({
    description: '게시글 태그',
    enum: Tag,
    required: false,
  })
  @IsEnum(Tag)
  @IsOptional()
  @Expose()
  readonly tag: Tag;

  @ApiProperty({
    description: '게시글 카테고리',
    enum: Category,
    required: false,
  })
  @IsEnum(Category)
  @IsOptional()
  @Expose()
  readonly category: Category;

  @ApiProperty({
    description: '제목이나 내용에서 검색하고 싶은 텍스트',
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  readonly text: string;

  @ApiProperty({
    description: '게시글 작성자의 동물',
    enum: Animal,
    required: false,
  })
  @IsEnum(Animal)
  @IsOptional()
  @Expose()
  readonly animal: Animal;
}
