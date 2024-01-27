import { IsArray } from 'class-validator';

export class DeleteFilesDto {
  @IsArray()
  keys: string[];
}
