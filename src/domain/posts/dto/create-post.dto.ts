import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { Tag } from '@/domain/types/enum/tags.enum';

export class CreatePostDto {
  @ApiProperty({
    example: '여자친구가 자꾸 방귀를 뀌어요 ㅠㅠ',
    description: '게시글 제목',
    required: true,
  })
  @IsString()
  readonly title: string;

  @ApiProperty({
    example: '소리는 작은데 냄새가...',
    description: '게시글 내용',
    required: true,
  })
  @IsString()
  readonly content: string;

  @ApiProperty({
    name: 'is_anonymous',
    example: 'false',
    description: '익명 여부',
    default: true,
    nullable: true,
  })
  @IsBoolean()
  @Expose({ name: 'is_anonymous' })
  readonly isAnonymous: boolean = true;

  @ApiProperty({
    example: '["dating", "advise"]',
    description: '게시글 태그 목록',
    isArray: true,
    enum: Tag,
  })
  @IsEnum(Tag, { each: true })
  readonly tags: Tag[];
}
