import {
  IsArray,
  IsDate,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UpdatePollItemDto } from '@/domain/pollItems/dto/update-pollItem.dto';

export class UpdatePollDto {
  @ApiProperty({
    example: '점메추',
    description: '투표 제목',
    required: true,
  })
  @IsString()
  @IsOptional()
  readonly title: string;

  @ApiProperty({
    name: 'poll_item_dtos',
    example:
      '[{ "id": 1, "content": "치킨" }, { "id": 2, "content": "피자" }, { "id": 3, "content": "제육볶음" }]',
    description: '투표 항목 DTO',
    required: true,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdatePollItemDto)
  @Expose({ name: 'poll_item_dtos' })
  readonly pollItemDtos: UpdatePollItemDto[];

  // @ApiProperty({
  //   example: '점메추',
  //   description: '복수 선택 가능',
  //   default: false,
  //   nullable: true,
  // })
  // @IsBoolean()
  // @IsOptional()
  // @Expose({ name: 'allow_multiple_choices' })
  // readonly allowMultipleChoices: boolean;

  @ApiProperty({
    example: '',
    description: '투표 종료 시각',
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Expose({ name: 'ended_at' })
  readonly endedAt: Date;
}
