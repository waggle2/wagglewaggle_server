import { UserUnauthorizedException } from '@/exceptions/domain/authentication.exception';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshAuthenticationGuard extends AuthGuard('refresh') {
  async canActivate(context: ExecutionContext) {
    try {
      await super.canActivate(context);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UserUnauthorizedException('Refresh token expired.');
      } else {
        throw error;
      }
    }
  }
}
