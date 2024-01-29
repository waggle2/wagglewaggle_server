import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import TokenPayload from './interfaces/token-payload.interface';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    // @InjectRepository(Credential)
    // private readonly credentialRepository: Repository<Credential>,
  ) {}

  // 회원가입
  async register(registrationData: CreateUserDto): Promise<void> {
    const { authenticationProvider, email, password } = registrationData;
    if (authenticationProvider === 'email' && (!email || !password)) {
      throw new BadRequestException('이메일 및 비밀번호가 필요합니다.');
    }

    if (password) {
      const hashedPassword = await this.hashPassword(password);
      await this.usersService.create({
        ...registrationData,
        password: hashedPassword,
      });
    }

    await this.usersService.create(registrationData);
  }

  // 로그인
  async emailLogin(email: string, hashedPassword: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const isMatchPassword = await this.comparePassword(
      hashedPassword,
      user.credential.password,
    );
    if (!isMatchPassword) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return user;
  }

  //   // 카카오 로그인
  //   public async kakaoLogin() {}

  //   // 네이버 로그인
  //   public async naverLogin() {}

  //   // 구글 로그인
  //   public async googleLogin() {}

  // 로그아웃 (빈 값의 쿠키 반환)
  async getCookieForLogout() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  //   async updatePassword(user: User, password: string, newPassword: string) {
  //     const isMatch = await this.comparePassword(
  //       password,
  //       user.credential.password,
  //     );
  //     if (!isMatch) {
  //       throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
  //     }

  //     user.credential.password = await this.hashPassword(newPassword);

  //     await this.credentialRepository.save(user.credential);
  //   }

  // 비밀번호 해싱
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // 비밀번호 비교
  async comparePassword(
    userInputPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(userInputPassword, hashedPassword);
  }

  // access token 생성, 쿠키 반환
  async getCookieWithAccessToken(user: User) {
    const payload: TokenPayload = {
      userId: user.id,
      authorities: user.authorities,
    }; // JWT 토큰의 페이로드로 사용될 객체 생성
    const token = this.jwtService.sign(payload);
    return `accessToken=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`; // JWT 토큰을 쿠키 형태로 반환, 쿠키이름=토큰 값, Path=쿠키가 적용되는 URL 경로
  }

  // refresh token 생성, 쿠키 반환
  async getCookieWithRefreshToken(user: User) {
    const payload: TokenPayload = { userId: user.id };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
    });
    return `refreshToken=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_EXPIRATION_TIME')}`;
  }
}
