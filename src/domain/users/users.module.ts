import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Credential } from './entities/credential.entity';
import { UserAuthority } from './entities/user-authority.entity';
import { ExitReason } from './entities/exit-reason.entity';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { HttpModule } from '@nestjs/axios';
import { JwtAuthenticationGuard } from '../authentication/guards/jwt-authentication.guard';
import { JwtService } from '@nestjs/jwt';
import { ItemCart } from '../items/entities/item-cart.entity';
import { Item } from '../items/entities/item.entity';
import { ProfileItems } from './entities/profile-items.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Credential,
      UserAuthority,
      ExitReason,
      ItemCart,
      Item,
      ProfileItems,
    ]),
    HttpModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    JwtService,
    RedisCacheService,
    JwtAuthenticationGuard,
  ],
  exports: [UsersService],
})
export class UsersModule {}
