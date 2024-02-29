import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlockUserDto {
  @ApiProperty({
    example: '77e88f4b-5ff5-47f9-9b3b-b1757c491cbb',
    description: '차단할 유저 ',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  blockedUserId: string;
}
