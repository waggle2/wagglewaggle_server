import { Animal } from '@/@types/enum/animal.enum';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStickerDto {
  @ApiProperty({
    example: '곰',
    description: '어떤 동물의 스티커인지 알려주세요',
    enum: Animal,
  })
  @IsEnum(Animal)
  readonly animal: Animal;
}
