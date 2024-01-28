import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, Length } from 'class-validator';
import { Tag } from '@/domain/types/enum/tags.enum';
import { Animal } from '@/domain/types/enum/animal.enum';

export class CreatePostDto {
  @ApiProperty({
    example: '여자친구가 자꾸 방귀를 뀌어요 ㅠㅠ',
    description: '게시글 제목, 1~50자의 제한을 두었습니다',
    required: true,
  })
  @Length(1, 50, { message: '제목의 길이는 1에서 50 사이어야 합니다.' })
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
    example: 'bear',
    description: '희망 댭변 동물',
    enum: Animal,
  })
  @IsEnum(Animal)
  @Expose({ name: 'preferred_response_animal' })
  readonly preferredResponseAnimal: Animal;

  @ApiProperty({
    example: '["dating", "advise"]',
    description: '게시글 태그 목록',
    isArray: true,
    enum: Tag,
  })
  @IsEnum(Tag, { each: true })
  readonly tags: Tag[];
}
