import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import RequestWithUser from './interfaces/request-with-user.interface';
import { Response } from 'express';
import { JwtAuthenticationGuard } from './guards/jwt-authentication.guard';
import { RefreshAuthenticationGuard } from './guards/refresh-authentication.guard';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post()
  @ApiOperation({ summary: '회원가입' })
  async register(@Body() createUserDto: CreateUserDto) {
    await this.authenticationService.register(createUserDto);
    return { message: '회원가입이 완료되었습니다.' };
  }

  @HttpCode(200)
  @Post('/login')
  @ApiOperation({ summary: '이메일 로그인' })
  async emailLogin(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() response: Response,
  ) {
    const user = await this.authenticationService.emailLogin(email, password);
    const accessCookie =
      await this.authenticationService.getCookieWithAccessToken(user);
    const refreshCookie =
      await this.authenticationService.getCookieWithRefreshToken(user);
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    user.credential.password = undefined;
    return response.send({ message: '로그인 되었습니다.' });
  }

  @HttpCode(200)
  @Post('/login/kakao')
  @ApiOperation({ summary: '카카오 로그인' })
  async kakaoLogin(
    @Query('authorizationCode') authorizationCode: string,
    @Res() response: Response,
  ) {
    const { user, accessCookie, refreshCookie, message, userData } =
      await this.authenticationService.socialLogin(
        'kakao',
        authorizationCode,
        null,
      );
    if (!user) {
      return response.send({ message, userData });
    }
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return response.send({ message: '로그인 되었습니다.' });
  }

  @HttpCode(200)
  @Post('/login/naver')
  @ApiOperation({ summary: '네이버 로그인' })
  async naverLogin(
    @Query('authorizationCode') authorizationCode: string,
    @Query('state') state: string,
    @Res() response: Response,
  ) {
    const { user, accessCookie, refreshCookie, message, userData } =
      await this.authenticationService.socialLogin(
        'naver',
        authorizationCode,
        state,
      );
    if (!user) {
      return response.send({ message, userData });
    }
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return response.send({ message: '로그인 되었습니다.' });
  }

  @HttpCode(200)
  @Post('/login/google')
  @ApiOperation({ summary: '구글 로그인' })
  async googleLogin(
    @Query('authorizationCode') authorizationCode: string,
    @Res() response: Response,
  ) {
    const { user, accessCookie, refreshCookie, message, userData } =
      await this.authenticationService.socialLogin(
        'google',
        authorizationCode,
        null,
      );
    if (!user) {
      return response.send({ message, userData });
    }
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return response.send({ message: '로그인 되었습니다.' });
  }

  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  @Post('/logout')
  @ApiOperation({ summary: '로그아웃' })
  async logout(@Res() response: Response) {
    const { accessCookie, refreshCookie } =
      await this.authenticationService.getCookieForLogout();
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return response.send({ message: '로그아웃 되었습니다.' });
  }

  @Patch()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '비밀번호 수정' })
  async updatePassword(
    @Req() request: RequestWithUser,
    @Body('password') password: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authenticationService.updatePassword(
      request.user,
      password,
      newPassword,
    );
    return { message: '비밀번호가 변경되었습니다.' };
  }

  @Patch('password-reset')
  @ApiOperation({ summary: '비밀번호 재설정' })
  async resetPassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authenticationService.resetPassword(email, newPassword);
    return { message: '비밀번호가 재설정되었습니다.' };
  }

  @Post('refresh-token')
  @UseGuards(RefreshAuthenticationGuard)
  @ApiOperation({ summary: '액세스 토큰 재발급' })
  async refreshToken(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const accessCookie =
      await this.authenticationService.getCookieWithAccessToken(request.user);
    response.setHeader('Set-Cookie', [accessCookie]);
    return response.send({ message: '새로운 액세스 토큰이 발급되었습니다.' });
  }
}
