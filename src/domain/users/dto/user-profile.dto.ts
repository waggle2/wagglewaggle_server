import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Animal } from '@/@types/enum/animal.enum';
import { User } from '@/domain/users/entities/user.entity';
import { ProfileItems } from '../entities/profile-items.entity';

export class UserProfileDto {
  @ApiProperty({ type: String, description: '유저 ID' })
  @Expose()
  readonly id: string;

  @ApiProperty({ type: String, description: '유저 닉네임' })
  @Expose()
  readonly nickname: string;

  @ApiProperty({ enum: Animal, description: '유저가 지정한 프로필 동물' })
  @Expose()
  readonly profileAnimal: Animal;

  @ApiProperty({ type: [ProfileItems], description: '유저가 착용한 아이템' })
  @Expose()
  readonly profileItems: ProfileItems[];

  constructor(user: User) {
    this.id = user.id;
    this.nickname = user.credential.nickname;
    this.profileAnimal = user.profileAnimal;
    this.profileItems = user.profileItems;
  }
}
