import { IsString } from 'class-validator';

export class PresignUrlsDto {
  @IsString()
  readonly filename: string;

  @IsString()
  readonly type: string;
}
