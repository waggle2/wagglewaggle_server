import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Animal } from '@/@types/enum/animal.enum';
import { User } from '@/domain/users/entities/user.entity';
import { ProfileItems } from '../entities/profile-items.entity';
import { State } from '@/@types/enum/user.enum';

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

  @ApiProperty({ enum: State, description: '가입 상태 (가입, 탈퇴, 추방)' })
  @Expose()
  readonly state: State;

  @ApiProperty({ type: [String], description: '이 유저가 차단한 유저들' })
  usersBlockedByThisUser: string[];

  @ApiProperty({ type: [String], description: '이 유저를 차단한 유저들' })
  usersBlockingThisUser: string[];

  constructor(user: User) {
    this.id = user.id;
    this.nickname = user.credential.nickname;
    this.profileAnimal = user.profileAnimal;
    this.profileItems = user.profileItems;
    this.state = user.state;
    this.usersBlockedByThisUser = user.usersBlockedByThisUser;
    this.usersBlockingThisUser = user.usersBlockingThisUser;
  }
}
