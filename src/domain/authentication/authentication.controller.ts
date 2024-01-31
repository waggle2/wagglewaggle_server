import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthenticationGuard } from './guards/local-authentication.guard';
import RequestWithUser from './interfaces/request-with-user.interface';
import { Response } from 'express';
import JwtAuthenticationGuard from './guards/jwt-authentication.guard';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post()
  @ApiOperation({ summary: '회원가입' })
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authenticationService.register(createUserDto);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('/login')
  @ApiOperation({ summary: '이메일 로그인' })
  async emailLogin(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const accessCookie =
      await this.authenticationService.getCookieWithAccessToken(user);
    const refreshCookie =
      await this.authenticationService.getCookieWithRefreshToken(user);
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    user.credential.password = undefined;
    return response.send(user);
  }

  @HttpCode(200)
  @Post('/login/kakao')
  @ApiOperation({ summary: '카카오 로그인' })
  async kakaoLogin(
    @Body() authorizationCode: string,
    @Res() response: Response,
  ) {
    const { user, accessCookie, refreshCookie } =
      await this.authenticationService.socialLogin(
        'kakao',
        authorizationCode,
        null,
      );
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return response.send(user);
  }

  @HttpCode(200)
  @Post('/login/naver')
  @ApiOperation({ summary: '네이버 로그인' })
  async naverLogin(
    @Body() authorizationCode: string,
    state: string,
    @Res() response: Response,
  ) {
    const { user, accessCookie, refreshCookie } =
      await this.authenticationService.socialLogin(
        'naver',
        authorizationCode,
        state,
      );
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return response.send(user);
  }

  @HttpCode(200)
  @Post('/login/google')
  @ApiOperation({ summary: '구글 로그인' })
  async googleLogin(
    @Body() authorizationCode: string,
    @Res() response: Response,
  ) {
    const { user, accessCookie, refreshCookie } =
      await this.authenticationService.socialLogin(
        'google',
        authorizationCode,
        null,
      );
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return response.send(user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('/logout')
  @ApiOperation({ summary: '로그아웃' })
  async logout(@Res() response: Response) {
    response.setHeader(
      'Set-Cookie',
      await this.authenticationService.getCookieForLogout(),
    );
    return response.sendStatus(200);
  }

  // @Patch()
  // @UseGuards(JwtAuthenticationGuard)
  // @ApiOperation({ summary: '비밀번호 수정' })
  // async update(
  //   @Req() request: RequestWithUser,
  //   @Body() password: string,
  //   newPassword: string,
  // ) {
  //   return await this.authenticationService.updatePassword(
  //     request.user,
  //     password,
  //     newPassword,
  //   );
  // }
}
