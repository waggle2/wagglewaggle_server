import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreatePollItemDto } from '@/domain/pollItems/dto/create-pollItem.dto';

export class CreatePollDto {
  @ApiProperty({
    example: '점메추',
    description: '투표 제목, 1~50글자',
    required: true,
  })
  @IsString()
  @Length(1, 50, { message: '투표 제목은 1글자 이상 50글자 이하여야 합니다.' })
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

  // @ApiProperty({
  //   name: 'allow_multiple_choices',
  //   description: '복수 선택 가능',
  //   default: false,
  //   nullable: true,
  // })
  // @IsBoolean()
  // @Expose({ name: 'allow_multiple_choices' })
  // readonly allowMultipleChoices: boolean = false;

  @ApiProperty({
    name: 'ended_at',
    example: '2024-01-23T19:47:21.293Z',
    description: '투표 종료 시각',
    default: '현재 시각으로부터 2일 뒤',
    nullable: true,
    type: Date,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Expose({ name: 'ended_at' })
  readonly endedAt: Date;
}
