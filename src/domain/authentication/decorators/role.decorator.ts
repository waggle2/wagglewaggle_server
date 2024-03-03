import { AuthorityName } from '@/@types/enum/user.enum';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AuthorityName[]) =>
  SetMetadata(ROLES_KEY, roles);
