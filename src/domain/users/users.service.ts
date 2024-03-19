import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserAuthority } from './entities/user-authority.entity';
import { Credential } from './entities/credential.entity';
import { ExitReasonEnum, State } from '@/@types/enum/user.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { ExitReasonDto } from './dto/exit-reason.dto';
import { ExitReason } from './entities/exit-reason.entity';
import {
  UserBadRequestException,
  UserNotFoundException,
} from '@/domain/users/exceptions/users.exception';
import * as bcrypt from 'bcrypt';
import { UserUnauthorizedException } from '@/domain/authentication/exceptions/authentication.exception';
import { ItemCart } from '../items/entities/item-cart.entity';
import { Animal } from '@/@types/enum/animal.enum';
import { UserStickers } from './entities/user-stickers.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAuthority)
    private readonly userAuthorityRepository: Repository<UserAuthority>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(UserStickers)
    private readonly userStickersRepository: Repository<UserStickers>,
    @InjectRepository(ExitReason)
    private readonly exitReasonRepository: Repository<ExitReason>,
    @InjectRepository(ItemCart)
    private readonly itemCartRepository: Repository<ItemCart>,
    private readonly mailerService: MailerService,
    private readonly redisCacheService: RedisCacheService,
    private readonly httpService: HttpService,
  ) {}

  // 회원 생성
  async create(createUserDto: CreateUserDto): Promise<void> {
    const {
      authenticationProvider,
      socialId,
      email,
      password,
      nickname,
      birthYear,
      gender,
      primaryAnimal,
    } = createUserDto;

    const user = this.userRepository.create({
      authenticationProvider,
      socialId: socialId || null,
      primaryAnimal,
      profileAnimal: primaryAnimal,
    });
    await this.userRepository.save(user);

    const animals = [Animal.CAT, Animal.BEAR, Animal.DOG, Animal.FOX];
    const itemCartPromises = animals.map(async (animal) => {
      const itemCart = this.itemCartRepository.create({
        user: { id: user.id },
        animal,
        items: [],
      });
      return this.itemCartRepository.save(itemCart);
    });
    await Promise.all(itemCartPromises);

    const credential = this.credentialRepository.create({
      user: { id: user.id },
      email: email || null,
      password: password || null,
      nickname,
      birthYear,
      gender,
    });

    const userAuthority = this.userAuthorityRepository.create({
      user: { id: user.id },
    });

    const stickers = this.userStickersRepository.create({
      user: { id: user.id },
    });

    await this.credentialRepository.save(credential);
    await this.userAuthorityRepository.save(userAuthority);
    await this.userStickersRepository.save(stickers);
  }

  // 회원가입 이메일 인증 코드 전송
  async sendSignupCode(email: string): Promise<void> {
    const emailVerificationCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

    await this.redisCacheService.set(email, emailVerificationCode, 60 * 5);

    const sendMessageInfo = await this.mailerService.sendMail({
      to: email,
      subject: '[와글와글] 회원가입 이메일 인증 메일입니다.',
      template: 'sign-up',
      context: {
        email,
        emailVerificationCode,
      },
    });

    if (!sendMessageInfo) {
      throw new UserNotFoundException('이메일을 보낼 수 없습니다.');
    }
  }

  // 비밀번호 재설정 이메일 인증 코드 전송
  async sendPasswordResetCode(email: string): Promise<void> {
    const existingUser = await this.findByEmail(email);
    if (!existingUser) {
      throw new UserNotFoundException('사용자를 찾을 수 없습니다.');
    }

    const emailVerificationCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

    await this.redisCacheService.set(email, emailVerificationCode, 60 * 5);

    const sendMessageInfo = await this.mailerService.sendMail({
      to: email,
      subject: '[와글와글] 비밀번호 재설정을 위한 이메일 인증 메일입니다.',
      template: 'password-reset',
      context: {
        email,
        emailVerificationCode,
      },
    });

    if (!sendMessageInfo) {
      throw new UserNotFoundException('이메일을 보낼 수 없습니다.');
    }
  }

  // 이메일 인증코드 확인
  async verifyEmail(email: string, code: number): Promise<boolean> {
    const savedCode = await this.redisCacheService.get(email);

    if (!savedCode || code !== Number(savedCode)) {
      return false;
    }

    return true;
  }

  // 닉네임 중복 확인
  async checkNickname(
    nickname: string,
    email?: string,
    socialId?: string,
  ): Promise<boolean> {
    const existingUser = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.credential', 'credential')
      .where('credential.nickname = :nickname', { nickname })
      .withDeleted()
      .getOne();
    if (existingUser) {
      if (email) {
        const user = await this.findByEmail(email);
        if (
          user &&
          user.state === State.WITHDRAWN &&
          user.id === existingUser.id
        ) {
          return true;
        }
      } else if (socialId) {
        const user = await this.findBySocialId(socialId);
        if (
          user &&
          user.state === State.WITHDRAWN &&
          user.id === existingUser.id
        ) {
          return true;
        }
      }
      return false;
    }
    return true;
  }

  // 이메일로 회원 정보 조회
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.credential', 'credential')
      .leftJoinAndSelect('user.authorities', 'authorities')
      .where('credential.email = :email', { email })
      .withDeleted()
      .getOne();

    return user;
  }

  // socialId로 회원 정보 조회
  async findBySocialId(socialId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { socialId },
      withDeleted: true,
      relations: ['credential', 'authorities'],
    });

    return user;
  }

  // id로 회원 정보 조회
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'credential',
        'authorities',
        'userStickers',
        'profileItems',
        'profileItems.emoji',
        'profileItems.background',
        'profileItems.wallpaper',
        'profileItems.frame',
      ],
    });
    if (!user) {
      throw new UserNotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async findByIdWithDeleted(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: [
        'credential',
        'authorities',
        'userStickers',
        'profileItems',
        'profileItems.emoji',
        'profileItems.background',
        'profileItems.wallpaper',
        'profileItems.frame',
      ],
    });
    if (!user) {
      throw new UserNotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  // 상대 프로필 정보 조회
  async findOtherUserProfile(id: string): Promise<User> {
    const otherUser = await this.userRepository.findOne({
      where: { id },
      relations: [
        'credential',
        'userStickers',
        'profileItems',
        'profileItems.emoji',
        'profileItems.background',
        'profileItems.wallpaper',
        'profileItems.frame',
      ],
    });
    if (!otherUser) {
      throw new UserNotFoundException('사용자를 찾을 수 없습니다.');
    }

    return otherUser;
  }

  // 닉네임 수정
  async updateNickname(user: User, nickname: string): Promise<void> {
    const existingUser = await this.checkNickname(nickname);
    if (!existingUser) {
      throw new UserBadRequestException('중복된 닉네임입니다.');
    }
    user.credential.nickname = nickname;
    await this.credentialRepository.save(user.credential);
  }

  // 본인인증
  async updateVerificationStatus(user: User, impUid: string): Promise<boolean> {
    // 인증 토큰 발급 받기
    const getTokenRequest = this.httpService
      .post(
        'https://api.iamport.kr/users/getToken',
        {
          imp_key: process.env.PORTONE_REST_API_KEY,
          imp_secret: process.env.PORTONE_REST_API_SECRET,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
      .pipe(map((res) => res.data?.response.access_token))
      .pipe(
        catchError(() => {
          throw new UserUnauthorizedException(
            '본인인증에 실패했습니다. 토큰을 가져오지 못했습니다.',
          );
        }),
      );
    const accessToken = await lastValueFrom(getTokenRequest);

    // imp_uid로 인증 정보 조회
    const getCertificationsRequest = this.httpService
      .get(`https://api.iamport.kr/certifications/${impUid}`, {
        headers: { Authorization: accessToken },
      })
      .pipe(map((res) => res.data?.response.birthday))
      .pipe(
        catchError(() => {
          throw new UserUnauthorizedException(
            '본인인증에 실패했습니다. 유저 정보를 찾을 수 없습니다.',
          );
        }),
      );
    const birthday = await lastValueFrom(getCertificationsRequest);
    const birth = Number(birthday.substring(0, 4));

    user.isVerified = true;
    user.credential.birthYear = birth;
    await this.userRepository.save(user);
    await this.credentialRepository.save(user.credential);

    return true;
  }

  // 재가입 시 회원정보 업데이트
  async update(userId: string, updateUserDto: UpdateUserDto): Promise<void> {
    const user = await this.findByIdWithDeleted(userId);
    user.deletedAt = null;
    Object.assign(user, updateUserDto);
    user.state = State.JOINED;
    user.isVerified = false;

    await this.userRepository.save(user);
  }

  // 회원 탈퇴
  async remove(id: string, exitReasonDto: ExitReasonDto): Promise<void> {
    const user = await this.findById(id);
    user.state = State.WITHDRAWN;
    await this.userRepository.save(user);
    await this.userRepository.softDelete(id);

    const exitReason = new ExitReason();
    exitReason.userId = id;
    exitReason.reason = exitReasonDto.reason;
    if (exitReasonDto.reason === ExitReasonEnum.OTHER) {
      exitReason.otherReasons = exitReasonDto.otherReasons;
    }
    await this.exitReasonRepository.save(exitReason);
  }

  /* 관리자 페이지 */

  // 전체 회원 조회(관리자)
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      withDeleted: true,
      relations: ['credential', 'authorities'],
    });
  }

  // 회원 추방(관리자)
  async expelMember(id: string): Promise<void> {
    const user = await this.findByIdWithDeleted(id);
    user.state = State.EXPELLED;
    await this.userRepository.save(user);
    await this.userRepository.softDelete(id);
  }

  // refresh token을 데이터베이스에 저장
  async setCurrentRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    const currentRefreshToken =
      await this.getCurrentHashedRefreshToken(refreshToken);
    await this.userRepository.update(userId, {
      currentRefreshToken: currentRefreshToken,
    });
  }

  async getCurrentHashedRefreshToken(refreshToken: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(refreshToken, salt);
  }

  /* 임시 */

  // 코인 조절(임시)
  async addCoins(user: User, animal: Animal, coins: number) {
    let coinsField: string;
    switch (animal) {
      case Animal.BEAR:
        coinsField = 'bearCoins';
        break;
      case Animal.CAT:
        coinsField = 'catCoins';
        break;
      case Animal.DOG:
        coinsField = 'dogCoins';
        break;
      case Animal.FOX:
        coinsField = 'foxCoins';
        break;
    }
    user[coinsField] += coins;
    await this.userRepository.save(user);
    return user[coinsField];
  }

  // 보유중인 아이템 제거(임시)
  async removeUserItems(user: User) {
    user.items = [];
    this.userRepository.save(user);
  }
}
