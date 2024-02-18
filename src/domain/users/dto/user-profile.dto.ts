import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Animal } from '@/@types/enum/animal.enum';
import { User } from '@/domain/users/entities/user.entity';

export class UserProfileDto {
  @ApiProperty({ type: String, description: '유저 ID' })
  @Expose()
  readonly id: string;

  @ApiProperty({ type: String, description: '유저 닉네임' })
  @Expose()
  readonly nickname: string;

  @ApiProperty({ enum: Animal, description: '유저 동물' })
  @Expose()
  readonly animal: Animal;

  constructor(user: User) {
    this.id = user.id;
    this.nickname = user.credential.nickname;
    this.animal = user.profileAnimal;
  }
}
