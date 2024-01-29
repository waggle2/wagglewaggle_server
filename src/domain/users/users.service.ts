import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserAuthority } from './entities/user-authority.entity';
import { Credential } from './entities/credential.entity';
import { State } from '../types/enum/user.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAuthority)
    private readonly userAuthorityRepository: Repository<UserAuthority>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly mailerService: MailerService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    const {
      authenticationProvider,
      email,
      password,
      nickname,
      birthYear,
      gender,
      primaryAnimal,
    } = createUserDto;

    const user = this.userRepository.create({
      authenticationProvider,
      primaryAnimal,
    });

    const credential = this.credentialRepository.create({
      user,
      email: email || null,
      password: password || null,
      nickname,
      birthYear,
      gender,
    });

    const userAuthority = this.userAuthorityRepository.create({
      user,
    });

    await this.credentialRepository.save(credential);
    await this.userAuthorityRepository.save(userAuthority);
    await this.userRepository.save(user);
  }

  async sendSignupCode(email: string): Promise<void> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('중복된 이메일입니다.');
    }

    const emailVerificationCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

    await this.redisCacheService.set(email, emailVerificationCode, 60 * 5);

    const sendMessageInfo = await this.mailerService.sendMail({
      to: email,
      subject: '[와글와글] 회원가입 이메일 인증 메일입니다.',
      template: 'email-verification',
      context: {
        email,
        emailVerificationCode,
      },
    });

    if (!sendMessageInfo) {
      throw new NotFoundException('이메일을 보낼 수 없습니다.');
    }
  }

  async sendPasswordResetCode(email: string): Promise<void> {
    const existingUser = await this.findByEmail(email);
    if (!existingUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const emailVerificationCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

    await this.redisCacheService.set(email, emailVerificationCode, 60 * 5);

    const sendMessageInfo = await this.mailerService.sendMail({
      to: email,
      subject: '[와글와글] 비밀번호 재설정을 위한 이메일 인증 메일입니다.',
      template: 'email-verification',
      context: {
        email,
        emailVerificationCode,
      },
    });

    if (!sendMessageInfo) {
      throw new NotFoundException('이메일을 보낼 수 없습니다.');
    }
  }

  async verifyEmail(email: string, code: number): Promise<boolean> {
    const savedCode = await this.redisCacheService.get(email);

    if (!savedCode || code !== Number(savedCode)) {
      throw new BadRequestException('이메일 인증 코드가 일치하지 않습니다.');
    }

    return true;
  }

  async checkNickname(nickname: string): Promise<boolean> {
    const existingUser = await this.credentialRepository.findOne({
      where: { nickname },
    });
    return !existingUser;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.credential', 'credential')
      .where('credential.email = :email', { email })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['credential', 'authorities'],
    });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async updateNickname(user: User, nickname: string): Promise<void> {
    user.credential.nickname = nickname;
    await this.credentialRepository.save(user.credential);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    user.state = State.WITHDRAWN;
    await this.userRepository.save(user);
    await this.userRepository.softDelete(id);
  }
}
