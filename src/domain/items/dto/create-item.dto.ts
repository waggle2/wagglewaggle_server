import { Animal } from '@/@types/enum/animal.enum';
import { ItemType } from '@/@types/enum/item-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    example: '곰',
    description: '관련 동물',
    required: true,
  })
  @IsEnum(Animal)
  readonly animal: Animal;

  @ApiProperty({
    example: '이모지',
    description: '아이템 종류(이모지, 프로필 배경, 프레임, 벽지)',
    required: true,
  })
  @IsEnum(ItemType)
  readonly itemType: ItemType;

  @ApiProperty({
    example: '줄무늬 벽지',
    description: '아이템 이름',
    required: true,
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: '100',
    description: '가격',
    required: true,
  })
  @IsNumber()
  readonly price: number;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: '이미지 url',
    required: true,
  })
  @IsString()
  readonly image: string;
}
