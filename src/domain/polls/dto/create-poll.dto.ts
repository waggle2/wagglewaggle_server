import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePollItemDto } from '@/domain/pollItems/dto/create-pollItem.dto';

export class CreatePollDto {
  @ApiProperty({
    example: '점메추',
    description: '투표 제목',
    required: true,
  })
  @IsString()
  readonly title: string;

  @ApiProperty({
    name: 'poll_item_dtos',
    example:
      '[{ "content": "국밥" }, { "content": "돈까스" }, { "content": "제육볶음" }]',
    description: '투표 항목 DTO',
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePollItemDto)
  @Expose({ name: 'poll_item_dtos' })
  readonly pollItemDtos: CreatePollItemDto[];

  @ApiProperty({
    name: 'is_anonymous',
    description: '투표 제목',
    default: true,
    nullable: true,
  })
  @IsBoolean()
  @Expose({ name: 'is_anonymous' })
  readonly isAnonymous: boolean = true;

  @ApiProperty({
    name: 'allow_multiple_choices',
    description: '복수 선택 가능',
    default: false,
    nullable: true,
  })
  @IsBoolean()
  @Expose({ name: 'allow_multiple_choices' })
  readonly allowMultipleChoices: boolean = false;

  @ApiProperty({
    name: 'ended_at',
    example: '2024-01-23T19:47:21.293Z',
    description: '투표 종료 시각',
    default: '현재 시각으로부터 3일 뒤',
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Expose({ name: 'ended_at' })
  readonly endedAt: Date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 현재 날짜로부터 3일 뒤
}
