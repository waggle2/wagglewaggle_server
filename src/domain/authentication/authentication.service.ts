import {
  BadRequestException,
  ForbiddenException,
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
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Credential } from '../users/entities/credential.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
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

  // 소셜 로그인
  async socialLogin(
    provider: string,
    authorizationCode: string,
    state: string,
  ) {
    let accessToken;
    let userData;

    switch (provider) {
      case 'kakao':
        accessToken = await this.getKakaoToken(
          authorizationCode,
          process.env.KAKAO_REST_API_KEY,
        );
        userData = await this.getKakaoUserData(accessToken);
        break;
      case 'naver':
        accessToken = await this.getNaverToken(
          authorizationCode,
          state,
          process.env.NAVER_CLIENT_ID,
          process.env.NAVER_CLIENT_SECRET,
        );
        userData = await this.getNaverUserData(accessToken);
        break;
      case 'google':
        accessToken = await this.getGoogleToken(
          authorizationCode,
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
        );
        userData = await this.getGoogleUserData(accessToken);
        break;
    }

    const user = await this.usersService.findBySocialId(userData.socialId);
    if (!user) {
      throw new NotFoundException('회원가입이 필요합니다.', userData);
    }

    const accessCookie = await this.getCookieWithAccessToken(user);
    const refreshCookie = await this.getCookieWithRefreshToken(user);

    return { user, accessCookie, refreshCookie, userData };
  }

  // 카카오 로그인 (get token)
  async getKakaoToken(code: string, client_id: string): Promise<string> {
    const data = new URLSearchParams();
    data.append('grant_type', 'authorization_code');
    data.append('client_id', client_id);
    data.append('code', code);

    const request = this.httpService
      .post('https://kauth.kakao.com/oauth/token', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })
      .pipe(map((res) => res.data?.access_token))
      .pipe(
        catchError(() => {
          throw new ForbiddenException('API not available');
        }),
      );

    return await lastValueFrom(request);
  }

  // 카카오 로그인 (get user info)
  async getKakaoUserData(
    accessToken: string,
  ): Promise<{ socialId: string; nickname: string }> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const request = this.httpService
      .get('https://kapi.kakao.com/v2/user/me', {
        headers,
      })
      .pipe(map((res) => res.data))
      .pipe(
        catchError(() => {
          throw new ForbiddenException('API not available');
        }),
      );

    const result = await lastValueFrom(request);

    return {
      socialId: result.id,
      nickname: result.kakao_account.profile.nickname,
    };
  }

  // 네이버 로그인 (get token)
  async getNaverToken(
    code: string,
    state: string,
    client_id: string,
    client_secret: string,
  ): Promise<string> {
    const data = new URLSearchParams();
    data.append('grant_type', 'authorization_code');
    data.append('client_id', client_id);
    data.append('client_secret', client_secret);
    data.append('code', code);
    data.append('state', state);

    const request = this.httpService
      .post('https://nid.naver.com/oauth2.0/token', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })
      .pipe(map((res) => res.data?.access_token))
      .pipe(
        catchError(() => {
          throw new ForbiddenException('API not available');
        }),
      );

    return await lastValueFrom(request);
  }

  // 네이버 로그인 (get user info)
  async getNaverUserData(
    accessToken: string,
  ): Promise<{ socialId: string; nickname: string }> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const request = this.httpService
      .get('https://openapi.naver.com/v1/nid/me', {
        headers,
      })
      .pipe(map((res) => res.data))
      .pipe(
        catchError(() => {
          throw new ForbiddenException('API not available');
        }),
      );

    const result = await lastValueFrom(request);

    return {
      socialId: result.response.id,
      nickname: result.response.nickname,
    };
  }

  // 구글 로그인 (get token)
  async getGoogleToken(
    code: string,
    client_id: string,
    client_secret: string,
  ): Promise<string> {
    // auth code를 URL 디코딩
    const decodedCode = decodeURIComponent(code);

    const data = new URLSearchParams();
    data.append('grant_type', 'authorization_code');
    data.append('client_id', client_id);
    data.append('client_secret', client_secret);
    data.append('code', decodedCode);
    data.append('redirect_uri', process.env.GOOGLE_REDIRECT_URL);

    const request = this.httpService
      .post('https://oauth2.googleapis.com/token', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })
      .pipe(map((res) => res.data?.access_token))
      .pipe(
        catchError(() => {
          throw new ForbiddenException('API not available');
        }),
      );

    return await lastValueFrom(request);
  }

  // 구글 로그인 (get user info)
  async getGoogleUserData(
    accessToken: string,
  ): Promise<{ socialId: string; nickname: string }> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const request = this.httpService
      .get('https://www.googleapis.com/userinfo/v2/me', {
        headers,
      })
      .pipe(map((res) => res.data))
      .pipe(
        catchError(() => {
          throw new ForbiddenException('API not available');
        }),
      );

    const result = await lastValueFrom(request);

    return {
      socialId: result.id,
      nickname: result.given_name,
    };
  }

  // 로그아웃 (빈 값의 쿠키 반환)
  async getCookieForLogout() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  // 비밀번호 수정
  async updatePassword(user: User, password: string, newPassword: string) {
    const isMatch = await this.comparePassword(
      password,
      user.credential.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.credentialRepository.update(
      { user },
      { password: hashedPassword },
    );
  }

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
