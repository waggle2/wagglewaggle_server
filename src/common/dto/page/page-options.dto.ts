import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PageOptionsDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  readonly page: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    default: 10,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  readonly pageSize: number = 10;
}
