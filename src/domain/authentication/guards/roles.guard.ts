import { AuthorityName } from '@/@types/enum/user.enum';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { UserForbiddenException } from '../exceptions/authentication.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<AuthorityName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    console.log(requiredRole);
    if (!requiredRole) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    console.log(user);

    if (
      !user.authorities.some((authority) =>
        requiredRole.includes(authority.authorityName),
      )
    ) {
      throw new UserForbiddenException('접근 권한이 없습니다.');
    }

    return true;
  }
}
