import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { UserUnauthorizedException } from '@/domain/authentication/exceptions/authentication.exception';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export const getUserIdFromToken = async (
  req: Request,
  configService: ConfigService,
  jwtService: JwtService,
) => {
  const accessToken = req.cookies.accessToken;
  const secret = configService.get('JWT_SECRET');
  try {
    const decoded = await jwtService.verifyAsync(accessToken, {
      secret,
    });
    return decoded.id;
  } catch (error) {
    if (error instanceof UnauthorizedException)
      throw new UserUnauthorizedException('Access token expired.');
  }
};
