import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  UseGuards,
  Req,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import RequestWithUser from '../authentication/interfaces/request-with-user.interface';
import { ExitReasonDto } from './dto/exit-reason.dto';
import { JwtAuthenticationGuard } from '../authentication/guards/jwt-authentication.guard';
import { HttpResponse } from '@/@types/http-response';
import { Animal } from '@/@types/enum/animal.enum';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(200)
  @Post('/email-verification')
  @ApiOperation({ summary: '회원가입 이메일 인증코드 전송' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'example@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '회원가입 이메일 인증코드가 전송되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '회원가입 이메일 인증코드가 전송되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '중복된 이메일입니다.',
  })
  @ApiResponse({
    status: 404,
    description: '이메일을 보낼 수 없습니다.',
  })
  async sendSignupCode(@Body('email') email: string) {
    await this.usersService.sendSignupCode(email);
    return HttpResponse.success('회원가입 이메일 인증코드가 전송되었습니다.');
  }

  @HttpCode(200)
  @Post('/email-verification/password')
  @ApiOperation({ summary: '비밀번호 재설정 이메일 인증코드 전송' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'example@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 이메일 인증코드가 전송되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '비밀번호 재설정 이메일 인증코드가 전송되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '이메일을 보낼 수 없습니다.',
  })
  async sendPasswordResetCode(@Body('email') email: string) {
    await this.usersService.sendPasswordResetCode(email);
    return HttpResponse.success(
      '비밀번호 재설정 이메일 인증코드가 전송되었습니다.',
    );
  }

  @HttpCode(200)
  @Post('/email-verification/confirm')
  @ApiOperation({ summary: '이메일 인증코드 확인' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'example@example.com',
        },
        verificationCode: {
          type: 'number',
          example: '123123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'verified: true/false',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '이메일 인증코드 검증 여부',
        },
        data: {
          type: 'object',
          properties: {
            verified: {
              type: 'boolean',
              example: 'true',
            },
          },
        },
      },
    },
  })
  async verifyEmail(
    @Body('email') email: string,
    @Body('verificationCode') verificationCode: number,
  ) {
    const result = await this.usersService.verifyEmail(email, verificationCode);
    return HttpResponse.success('이메일 인증코드 검증 여부', {
      verified: result,
    });
  }

  @Get('/nickname-check/:nickname')
  @ApiOperation({ summary: '닉네임 중복 확인' })
  @ApiResponse({
    status: 200,
    description: 'available: true/false',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '닉네임 사용 가능 여부',
        },
        data: {
          type: 'object',
          properties: {
            available: {
              type: 'boolean',
              example: 'true',
            },
          },
        },
      },
    },
  })
  async checkNickname(@Param('nickname') nickname: string) {
    const result = await this.usersService.checkNickname(nickname);
    return HttpResponse.success('닉네임 사용 가능 여부', {
      available: result,
    });
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '회원 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '회원 정보 반환',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '회원 정보가 조회되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            authenticationProvider: { type: 'string' },
            socialId: { type: 'string', nullable: true },
            isVerified: { type: 'boolean' },
            state: { type: 'string' },
            primaryAnimal: { type: 'string' },
            secondAnimal: { type: 'string', nullable: true },
            profileAnimal: { type: 'string' },
            catPoints: { type: 'integer' },
            bearPoints: { type: 'integer' },
            dogPoints: { type: 'integer' },
            foxPoints: { type: 'integer' },
            currentRefreshToken: { type: 'string' },
            items: { type: 'array', items: { type: 'object' }, nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', nullable: true, format: 'date-time' },
            credential: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                email: { type: 'string' },
                nickname: { type: 'string' },
                birthYear: { type: 'integer' },
                gender: { type: 'string' },
              },
            },
            authorities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  authorityName: { type: 'string' },
                },
              },
            },
            profileItems: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없습니다.',
  })
  async findOne(@Req() request: RequestWithUser) {
    const { user } = request;
    user.credential.password = undefined;
    return HttpResponse.success('회원 정보가 조회되었습니다.', user);
  }

  @Patch('/nickname')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '닉네임 수정' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nickname: {
          type: 'string',
          example: '새로운닉네임',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '닉네임이 변경되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '닉네임이 변경되었습니다.',
        },
      },
    },
  })
  async updateNickname(
    @Req() request: RequestWithUser,
    @Body('nickname') nickname: string,
  ) {
    await this.usersService.updateNickname(request.user, nickname);
    return HttpResponse.success('닉네임이 변경되었습니다.');
  }

  @Patch('/verification/:impUid')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '본인 인증' })
  @ApiResponse({
    status: 200,
    description: 'true',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '본인인증이 완료되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '본인인증에 실패했습니다. 토큰을 가져오지 못했습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '본인인증에 실패했습니다. 유저 정보를 찾을 수 없습니다.',
  })
  async updateVerificationStatus(
    @Req() request: RequestWithUser,
    @Param('impUid') impUid: string,
  ) {
    await this.usersService.updateVerificationStatus(request.user, impUid);
    return HttpResponse.success('본인인증이 완료되었습니다.');
  }

  @Delete()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({
    status: 200,
    description: '회원 탈퇴가 완료되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '회원 탈퇴가 완료되었습니다.',
        },
      },
    },
  })
  async remove(
    @Req() request: RequestWithUser,
    @Body() exitReasonDto: ExitReasonDto,
  ) {
    const { user } = request;
    await this.usersService.remove(user.id, exitReasonDto);
    return HttpResponse.success('회원 탈퇴가 완료되었습니다.');
  }

  // 임시
  @Patch('/coins')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '코인 조절(임시)' })
  @ApiResponse({
    status: 200,
    description:
      '코인 수정 완료 (해당 동물(곰, 여우, 개, 고양이), 추가할 코인)',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '코인이 수정되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            totalCoins: { type: 'number', example: 50 },
          },
        },
      },
    },
  })
  async updateCoins(
    @Req() request: RequestWithUser,
    @Query('animal') animal: Animal,
    @Query('coins') coins: string,
  ) {
    const userCoins = await this.usersService.addCoins(
      request.user,
      animal,
      +coins,
    );
    return HttpResponse.success('코인이 수정되었습니다.', {
      totalCoins: userCoins,
    });
  }
}
