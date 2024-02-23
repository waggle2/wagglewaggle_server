import { UserUnauthorizedException } from '@/domain/authentication/exceptions/authentication.exception';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthenticationGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    try {
      await super.canActivate(context);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UserUnauthorizedException('Access token expired.');
      } else {
        throw error;
      }
    }
  }
}
