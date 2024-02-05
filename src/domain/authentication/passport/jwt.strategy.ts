import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import TokenPayload from '../interfaces/token-payload.interface';
import { UsersService } from '@/domain/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: TokenPayload) {
    const user = await this.usersService.findById(payload.id);
    req.user = user; // payload(request의 user 프로퍼티와 jwtService.verify()를 통해 검증해준 user 객체를 동일시해야함)
    return user;
  }
}
