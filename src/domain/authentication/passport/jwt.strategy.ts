import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthenticationService } from '../authentication.service';
import { UsersService } from '../../users/users.service';
import { Request, Response } from 'express';
import { Strategy } from 'passport-local';
import { ExtractJwt } from 'passport-jwt';
import TokenPayload from '../interfaces/token-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: TokenPayload, res: Response) {
    const accessToken = req.cookies.accessToken as string;
    if (!accessToken) {
      throw new UnauthorizedException(
        '로그인한 유저만 사용할 수 있는 서비스입니다.',
      );
    }
    // 액세스 토큰 검증
    const foundUser = await this.usersService.findById(payload.userId);
    if (!foundUser) {
      // 액세스 토큰이 만료된 경우 리프레시 토큰 검증(유효하다면 액세스 토큰 재발급)
      const refreshToken = req.cookies.refreshToken as string;
      if (!refreshToken) {
        throw new UnauthorizedException('인증되지 않은 사용자입니다.');
      }
      const refreshUser = await this.usersService.findById(payload.userId);
      if (!refreshUser) {
        throw new UnauthorizedException('새로 로그인해야 합니다.');
      }
      // 새로운 액세스 토큰 생성 후 쿠키에 저장
      const newAccessToken =
        await this.authenticationService.getCookieWithAccessToken(refreshUser);
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
      });
      req.user = refreshUser;
    } else {
      // 액세스 토큰이 유효한 경우 사용자 정보 추가
      req.user = foundUser;
    }
  }
}
