import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'asd@gmail.com',
    description: 'email',
    required: true,
  })
  @IsString()
  readonly email: string;

  @ApiProperty({
    example: 'P@ssw0rd!123',
    description: 'password',
    required: true,
  })
  @IsString()
  readonly password: string;
}
