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
  Headers,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import RequestWithUser from '../authentication/interfaces/request-with-user.interface';
import { ExitReasonDto } from './dto/exit-reason.dto';
import { JwtAuthenticationGuard } from '../authentication/guards/jwt-authentication.guard';
import { HttpResponse } from '@/@types/http-response';
import { Animal } from '@/@types/enum/animal.enum';
import { OtherUserProfileDto } from './dto/other-user-profile.dto';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/decorators/role.decorator';
import { AuthorityName } from '@/@types/enum/user.enum';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { PaginationSuccessResponse } from '@/common/decorators/pagination-success-response.decorator';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';

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
  async checkNickname(
    @Param('nickname') nickname: string,
    @Headers('email') email?: string,
    @Headers('socialId') socialId?: string,
  ) {
    const result = await this.usersService.checkNickname(
      nickname,
      email,
      socialId,
    );
    return HttpResponse.success('닉네임 사용 가능 여부', {
      available: result,
    });
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '회원 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '회원 정보 조회 성공',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없습니다.',
  })
  async findOne(@Req() req: RequestWithUser) {
    return HttpResponse.success(
      '회원 정보가 조회되었습니다.',
      new UserResponseDto(req.user),
    );
  }

  @Get('/profile/:userId')
  @ApiOperation({ summary: '상대 프로필 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '상대 프로필 정보가 조회되었습니다.',
    type: OtherUserProfileDto,
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없습니다.',
  })
  async findOtherUserProfile(@Param('userId') userId: string) {
    const otherUser = await this.usersService.findOtherUserProfile(userId);
    return HttpResponse.success(
      '상대 프로필 정보가 조회되었습니다.',
      new OtherUserProfileDto(otherUser),
    );
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

  /* 관리자 페이지 */
  @Get('/admin')
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(AuthorityName.ADMIN)
  @ApiOperation({ summary: '전체 회원 조회(관리자)' })
  @PaginationSuccessResponse(HttpStatus.OK, {
    model: PageDto,
    message: '전체 회원이 조회되었습니다.',
    generic: UserProfileDto,
  })
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    const [users, total] = await this.usersService.findAll(pageOptionsDto);
    const { data, meta } = new PageDto(
      users.map((user) => new UserResponseDto(user)),
      new PageMetaDto(pageOptionsDto, total),
    );
    return HttpResponse.success('전체 회원이 조회되었습니다.', data, meta);
  }

  @Delete('/admin/:userId')
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(AuthorityName.ADMIN)
  @ApiOperation({ summary: '회원 추방(관리자)' })
  @ApiResponse({
    status: 200,
    description: '회원 추방이 완료되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '회원 추방이 완료되었습니다.',
        },
      },
    },
  })
  async expelMember(@Param('userId') userId: string) {
    await this.usersService.expelMember(userId);
    return HttpResponse.success('회원 추방이 완료되었습니다.');
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

  // 임시
  @Delete('/items')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '보유중인 아이템 제거(임시)' })
  @ApiResponse({
    status: 200,
    description: '보유중인 아이템 전체 삭제',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '보유중인 아이템이 모두 삭제되었습니다.',
        },
      },
    },
  })
  async removeUserItems(@Req() req: RequestWithUser) {
    await this.usersService.removeUserItems(req.user);
    return HttpResponse.success('보유중인 아이템이 모두 삭제되었습니다.');
  }
}
