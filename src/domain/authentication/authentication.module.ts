import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RefreshStrategy } from './passport/refresh.strategy';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/domain/users/entities/user.entity';
import { Credential } from '../users/entities/credential.entity';
import { JwtAuthenticationGuard } from './guards/jwt-authentication.guard';
import { JwtStrategy } from './passport/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    HttpModule,
    TypeOrmModule.forFeature([User, Credential]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    JwtStrategy,
    RefreshStrategy,
    JwtAuthenticationGuard,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
