import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import RequestWithUser from './interfaces/request-with-user.interface';
import { Response } from 'express';
import { JwtAuthenticationGuard } from './guards/jwt-authentication.guard';
import { RefreshAuthenticationGuard } from './guards/refresh-authentication.guard';
import { LoginDto } from '@/domain/authentication/dto/login.dto';
import { HttpResponse } from '@/@types/http-response';

@Controller('authentication')
@ApiTags('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post()
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원가입이 완료되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: '회원가입이 완료되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      '(authenticationProvider가 email일 경우) 이메일 및 비밀번호가 필요합니다.',
  })
  async register(@Body() createUserDto: CreateUserDto) {
    await this.authenticationService.register(createUserDto);
    return HttpResponse.created('회원가입이 완료되었습니다.');
  }

  @HttpCode(200)
  @Post('/login')
  @ApiOperation({ summary: '이메일 로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '로그인 되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '비밀번호가 일치하지 않습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없습니다.',
  })
  async emailLogin(@Body() loginDto: LoginDto, @Res() response: Response) {
    const user = await this.authenticationService.emailLogin(loginDto);
    const accessCookie =
      await this.authenticationService.getCookieWithAccessToken(user);
    const refreshCookie =
      await this.authenticationService.getCookieWithRefreshToken(user);
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    user.credential.password = undefined;
    response.json({ code: 200, message: '로그인 되었습니다.' });
  }

  @HttpCode(200)
  @Post('/login/kakao')
  @ApiOperation({ summary: '카카오 로그인' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        authorizationCode: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인 되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '로그인 되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 302,
    description: '회원가입이 필요합니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 302 },
        message: {
          type: 'string',
          example: '회원가입이 필요합니다.',
        },
        data: {
          type: 'object',
          properties: {
            socialId: {
              type: 'string',
              example: '1234567890',
            },
            nickname: {
              type: 'string',
              example: '히히',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Kakao API not available',
  })
  async kakaoLogin(
    @Body('authorizationCode') authorizationCode: string,
    @Res() response: Response,
  ) {
    const { user, accessCookie, refreshCookie, message, userData } =
      await this.authenticationService.socialLogin(
        'kakao',
        authorizationCode,
        null,
      );
    if (!user) {
      return response.json({ code: 302, message: message, data: userData });
    }
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    response.json({ code: 200, message: '로그인 되었습니다.' });
  }

  @HttpCode(200)
  @Post('/login/naver')
  @ApiOperation({ summary: '네이버 로그인' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        authorizationCode: {
          type: 'string',
        },
        state: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인 되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '로그인 되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 302,
    description: '회원가입이 필요합니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 302 },
        message: {
          type: 'string',
          example: '회원가입이 필요합니다.',
        },
        data: {
          type: 'object',
          properties: {
            socialId: {
              type: 'string',
              example: '1234567890',
            },
            nickname: {
              type: 'string',
              example: '히히',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Naver API not available',
  })
  async naverLogin(
    @Body('authorizationCode') authorizationCode: string,
    @Body('state') state: string,
    @Res() response: Response,
  ) {
    const { user, accessCookie, refreshCookie, message, userData } =
      await this.authenticationService.socialLogin(
        'naver',
        authorizationCode,
        state,
      );
    if (!user) {
      return response.json({ code: 302, message: message, data: userData });
    }
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    response.json({ code: 200, message: '로그인 되었습니다.' });
  }

  @HttpCode(200)
  @Post('/login/google')
  @ApiOperation({ summary: '구글 로그인' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        authorizationCode: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인 되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '로그인 되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 302,
    description: '회원가입이 필요합니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 302 },
        message: {
          type: 'string',
          example: '회원가입이 필요합니다.',
        },
        data: {
          type: 'object',
          properties: {
            socialId: {
              type: 'string',
              example: '1234567890',
            },
            nickname: {
              type: 'string',
              example: '히히',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Google API not available',
  })
  async googleLogin(
    @Body('authorizationCode') authorizationCode: string,
    @Res() response: Response,
  ) {
    const { user, accessCookie, refreshCookie, message, userData } =
      await this.authenticationService.socialLogin(
        'google',
        authorizationCode,
        null,
      );
    if (!user) {
      return response.json({ code: 302, message: message, data: userData });
    }
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    response.json({ code: 200, message: '로그인 되었습니다.' });
  }

  @Get('/logout')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: 200,
    description: '로그아웃 되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '로그아웃 되었습니다.',
        },
      },
    },
  })
  async logout(@Res() response: Response) {
    const { accessCookie, refreshCookie } =
      await this.authenticationService.getCookieForLogout();
    response.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    response.json({ code: 200, message: '로그아웃 되었습니다.' });
  }

  @Patch()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '비밀번호 수정' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
          example: 'Password123!',
        },
        newPassword: {
          type: 'string',
          example: 'Password456@',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호가 변경되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '비밀번호가 변경되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '현재 비밀번호가 일치하지 않습니다.',
  })
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
    return HttpResponse.success('비밀번호가 변경되었습니다.');
  }

  @Patch('password-reset')
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiResponse({
    status: 200,
    description: '비밀번호가 재설정되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '비밀번호가 재설정되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없습니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'example@example.com',
        },
        newPassword: {
          type: 'string',
          example: 'Password456@',
        },
      },
    },
  })
  async resetPassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authenticationService.resetPassword(email, newPassword);
    return HttpResponse.success('비밀번호가 재설정되었습니다.');
  }

  @Get('refresh-token')
  @UseGuards(RefreshAuthenticationGuard)
  @ApiOperation({ summary: '액세스 토큰 재발급' })
  @ApiResponse({
    status: 200,
    description: '새로운 액세스 토큰이 발급되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '새로운 액세스 토큰이 발급되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token expired.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token.',
  })
  async refreshToken(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const accessCookie =
      await this.authenticationService.getCookieWithAccessToken(request.user);
    response.setHeader('Set-Cookie', [accessCookie]);
    response.json({
      code: 200,
      message: '새로운 액세스 토큰이 발급되었습니다.',
    });
  }
}
