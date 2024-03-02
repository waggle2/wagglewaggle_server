import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Animal } from '@/@types/enum/animal.enum';
import { User } from '@/domain/users/entities/user.entity';
import { ProfileItems } from '../entities/profile-items.entity';

export class OtherUserProfileDto {
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

  @ApiProperty({ enum: Animal, description: '유저 초기 자아 동물' })
  @Expose()
  readonly primaryAnimal: Animal;

  @ApiProperty({ enum: Animal, description: '유저 두 번째 자아 동물' })
  @Expose()
  readonly secondAnimal: Animal;

  @ApiProperty({ type: Object, description: '유저 총 스티커 개수' })
  @Expose()
  readonly userStickers: {
    bearStickers: number;
    foxStickers: number;
    dogStickers: number;
    catStickers: number;
  };

  constructor(user: User) {
    this.id = user.id;
    this.nickname = user.credential.nickname;
    this.profileAnimal = user.profileAnimal;
    this.profileItems = user.profileItems;
    this.primaryAnimal = user.primaryAnimal;
    this.secondAnimal = user.secondAnimal;
    this.userStickers = {
      bearStickers: user.userStickers?.bearStickers || 0,
      foxStickers: user.userStickers?.foxStickers || 0,
      dogStickers: user.userStickers?.dogStickers || 0,
      catStickers: user.userStickers?.catStickers || 0,
    };
  }
}
