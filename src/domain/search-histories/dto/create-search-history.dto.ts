import { IsString } from 'class-validator';

export class CreateSearchHistoryDto {
  @IsString()
  readonly keyword: string;

  @IsString()
  readonly userId: string;
}
