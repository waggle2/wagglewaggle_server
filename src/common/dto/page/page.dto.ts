import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  // @ApiProperty({ type: Number, description: '상태코드' })
  // @Expose()
  // readonly code: number;
  //
  // @ApiProperty({ type: String, description: '성공시 응답 메시지' })
  // @Expose()
  // readonly message: string;

  @IsArray()
  @ApiProperty({ type: 'generic', isArray: true })
  @Expose()
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  @Type(() => PageMetaDto)
  @Expose()
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
