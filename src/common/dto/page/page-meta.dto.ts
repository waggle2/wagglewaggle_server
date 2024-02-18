import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';

export class PageMetaDto {
  @ApiProperty({ description: '페이지 넘버입니다.' })
  @Expose()
  readonly page: number;

  @ApiProperty({ description: '한 페이지 당 원소 개수' })
  @Expose()
  readonly pageSize: number;

  @ApiProperty({ description: '총 아이템 숫자 ( 검색 조건에 맞는 )' })
  @Expose()
  readonly total: number;

  @ApiProperty({ description: '총 페이지 숫자 ( 검색 조건에 맞는 )' })
  @Expose()
  readonly pageCount: number;

  @ApiProperty({ description: '이전 페이지가 있는지에 대한 정보' })
  @Expose()
  readonly hasPreviousPage: boolean;

  @ApiProperty({ description: '다음 페이지가 있는지에 대한 정보' })
  @Expose()
  readonly hasNextPage: boolean;

  constructor(pageOptionsDto: PageOptionsDto, total: number) {
    this.page = pageOptionsDto.page;
    this.pageSize = pageOptionsDto.pageSize;
    this.total = total;
    this.pageCount = Math.ceil(this.total / this.pageSize);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
