import { IsNumber, IsPositive } from 'class-validator';

export class PaginationOptions {
  @IsNumber()
  @IsPositive()
  readonly page: number;

  @IsNumber()
  @IsPositive()
  readonly pageSize: number;
}
