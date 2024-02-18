import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ description: '유저 UUID', type: String })
  @IsString()
  @Expose()
  id: string;
}
