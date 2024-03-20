import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CreatePollItemDto } from '@/domain/polls/dto/create-pollItem.dto';
import { number } from 'joi';

export class UpdatePollDto {
  @ApiProperty({
    example: '점메추',
    description: '투표 제목',
    required: true,
  })
  @IsString()
  @IsOptional()
  readonly title: string;

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

  @ApiProperty({
    type: CreatePollItemDto,
    isArray: true,
    description: '추가할 투표 항목',
  })
  @IsOptional()
  @IsArray()
  @Type(() => CreatePollItemDto)
  readonly createPollItemDtos: CreatePollItemDto[];

  @ApiProperty({
    type: number,
    isArray: true,
    description: '삭제할 투표 항목',
    example: [1, 2],
  })
  @IsOptional()
  @IsArray()
  readonly deletePollItemIds: number[];
}
