import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/domain/users/users.service';
import { Request } from 'express';
import { Strategy } from 'passport-local';
import { ExtractJwt } from 'passport-jwt';
import TokenPayload from '../interfaces/token-payload.interface';

@Injectable()
export class AdultStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(payload: TokenPayload): Promise<void> {
    const user = await this.userService.findById(payload.id);

    if (user.isVerified) {
      if (new Date(user.credential.birthYear).getFullYear() <= 1999) {
        return;
      } else {
        throw new UnauthorizedException('성인 인증에 실패했습니다.');
      }
    } else {
      throw new UnauthorizedException('본인 인증이 필요합니다.');
    }
  }
}
