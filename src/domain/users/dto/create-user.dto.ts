import { Animal } from '@/@types/enum/animal.enum';
import { AuthenticationProvider, Gender } from '@/@types/enum/user.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'email',
    description: '가입 방식(kakao, naver, google, email)',
    required: true,
    enum: AuthenticationProvider,
  })
  @IsEnum(AuthenticationProvider)
  readonly authenticationProvider: AuthenticationProvider;

  @ApiProperty({
    example: '3145587907',
    description: '소셜 고유 id',
    required: false,
  })
  @IsString()
  @ValidateIf((o) => o.authenticationProvider !== 'email')
  @IsNotEmpty()
  readonly socialId?: string;

  @ApiProperty({
    example: 'asd@gmail.com',
    description: '이메일',
    required: false,
  })
  @IsString()
  @ValidateIf((o) => o.authenticationProvider === 'email')
  @IsNotEmpty()
  readonly email?: string;

  @ApiProperty({
    example: 'P@ssw0rd!123',
    description: '비밀번호',
    required: false,
  })
  @IsString()
  @ValidateIf((o) => o.authenticationProvider === 'email')
  @IsNotEmpty()
  readonly password?: string;

  @ApiProperty({
    example: '아아아',
    description: '닉네임',
    required: true,
  })
  @IsString()
  readonly nickname: string;

  @ApiProperty({
    example: '2000',
    description: '출생년도',
    required: true,
  })
  @IsNumber()
  readonly birthYear: number;

  @ApiProperty({
    example: '여성',
    description: '성별(남성, 여성)',
    required: true,
    enum: Gender,
  })
  @IsEnum(Gender)
  readonly gender: Gender;

  @ApiProperty({
    example: '곰',
    description: '동물 자아(곰, 여우, 개, 고양이)',
    required: true,
    enum: Animal,
  })
  @IsEnum(Animal)
  readonly primaryAnimal: Animal;
}
