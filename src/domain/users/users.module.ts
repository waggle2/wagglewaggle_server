import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Credential } from './entities/credential.entity';
import { UserAuthority } from './entities/user-authority.entity';
import { RedisCacheService } from '../redis-cache/redis-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Credential, UserAuthority])],
  controllers: [UsersController],
  providers: [UsersService, RedisCacheService],
  exports: [UsersService],
})
export class UsersModule {}
