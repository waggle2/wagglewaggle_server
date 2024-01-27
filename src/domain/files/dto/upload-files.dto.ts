import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class UploadFilesDto {
  @ApiProperty({
    description: '게시글 아이디',
    type: 'number',
    required: true,
    name: 'post_id',
  })
  @Expose({ name: 'post_id' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  readonly postId: number;
}
