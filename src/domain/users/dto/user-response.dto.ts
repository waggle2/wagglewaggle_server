import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Animal } from '@/@types/enum/animal.enum';
import { User } from '@/domain/users/entities/user.entity';
import { ProfileItems } from '../entities/profile-items.entity';
import { AuthenticationProvider, Gender, State } from '@/@types/enum/user.enum';
import { UserAuthority } from '../entities/user-authority.entity';

export class UserResponseDto {
  @ApiProperty({ type: String, description: '유저 ID' })
  @Expose()
  readonly id: string;

  @ApiProperty({ type: AuthenticationProvider, description: '가입 경로' })
  @Expose()
  readonly authenticationProvider: AuthenticationProvider;

  @ApiProperty({ type: String, description: '유저 소셜 고유id' })
  @Expose()
  readonly socialId: string;

  @ApiProperty({
    type: Object,
    description: '유저 이메일, 닉네임, 출생년도, 성별',
  })
  @Expose()
  readonly credential: {
    email: string;
    nickname: string;
    birthYear: number;
    gender: Gender;
  };

  @ApiProperty({ type: [UserAuthority], description: '유저 권한' })
  @Expose()
  readonly authorities: UserAuthority[];

  @ApiProperty({ enum: State, description: '가입 상태 (가입, 탈퇴, 추방)' })
  @Expose()
  readonly state: State;

  @ApiProperty({ type: Boolean, description: '유저 본인인증 여부' })
  @Expose()
  readonly isVerified: boolean;

  @ApiProperty({ enum: Animal, description: '초기 자아 동물' })
  @Expose()
  readonly primaryAnimal: Animal;

  @ApiProperty({ enum: Animal, description: '두 번째 자아 동물' })
  @Expose()
  readonly secondAnimal: Animal;

  @ApiProperty({ enum: Animal, description: '유저가 지정한 프로필 동물' })
  @Expose()
  readonly profileAnimal: Animal;

  @ApiProperty({ type: Object, description: '유저 총 스티커 개수' })
  @Expose()
  readonly userStickers: {
    bearStickers: number;
    foxStickers: number;
    dogStickers: number;
    catStickers: number;
  };

  @ApiProperty({ type: Number, description: '고냥이 코인' })
  @Expose()
  readonly catCoins: number;

  @ApiProperty({ type: Number, description: '곰돌이 코인' })
  @Expose()
  readonly bearCoins: number;

  @ApiProperty({ type: Number, description: '댕댕이 코인' })
  @Expose()
  readonly dogCoins: number;

  @ApiProperty({ type: Number, description: '폭스 코인' })
  @Expose()
  readonly foxCoins: number;

  @ApiProperty({ type: [Number], description: '유저가 갖고 있는 아이템' })
  @Expose()
  readonly items: number[];

  @ApiProperty({ type: [ProfileItems], description: '유저가 착용한 아이템' })
  @Expose()
  readonly profileItems: ProfileItems[];

  @ApiProperty({ type: Boolean, description: '유저 구독 여부' })
  @Expose()
  readonly isSubscribed: boolean;

  @ApiProperty({ type: [String], description: '이 유저가 차단한 유저들' })
  usersBlockedByThisUser: string[];

  @ApiProperty({ type: [String], description: '이 유저를 차단한 유저들' })
  usersBlockingThisUser: string[];

  @ApiProperty({ type: Date, description: '유저 가입 시기' })
  @Expose()
  readonly createdAt: Date;

  @ApiProperty({ type: Date, description: '유저 탈퇴 시기' })
  @Expose()
  readonly deletedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.authenticationProvider = user.authenticationProvider;
    this.socialId = user.socialId;
    this.credential = {
      email: user.credential.email,
      nickname: user.credential.nickname,
      birthYear: user.credential.birthYear,
      gender: user.credential.gender,
    };
    this.authorities = user.authorities;
    this.state = user.state;
    this.isVerified = user.isVerified;
    this.primaryAnimal = user.primaryAnimal;
    this.secondAnimal = user.secondAnimal;
    this.profileAnimal = user.profileAnimal;
    this.userStickers = {
      bearStickers: user.userStickers?.bearStickers || 0,
      foxStickers: user.userStickers?.foxStickers || 0,
      dogStickers: user.userStickers?.dogStickers || 0,
      catStickers: user.userStickers?.catStickers || 0,
    };
    this.catCoins = user.catCoins;
    this.bearCoins = user.bearCoins;
    this.dogCoins = user.dogCoins;
    this.foxCoins = user.foxCoins;
    this.items = user.items;
    this.profileItems = user.profileItems;
    this.isSubscribed = user.isSubscribed;
    this.usersBlockedByThisUser = user.usersBlockedByThisUser;
    this.usersBlockingThisUser = user.usersBlockingThisUser;
    this.createdAt = user.createdAt;
    this.deletedAt = user.deletedAt;
  }
}
