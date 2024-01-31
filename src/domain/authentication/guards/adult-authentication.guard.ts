import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdultAuthenticationGuard extends AuthGuard('jwt') {}
