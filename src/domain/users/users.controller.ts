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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import RequestWithUser from '../authentication/interfaces/request-with-user.interface';
import { ExitReasonDto } from './dto/exit-reason.dto';
import { JwtAuthenticationGuard } from '../authentication/guards/jwt-authentication.guard';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(200)
  @Post('/email-verification')
  @ApiOperation({ summary: '회원가입 이메일 인증코드 전송' })
  async sendSignupCode(@Body('email') email: string) {
    await this.usersService.sendSignupCode(email);
    return { message: '회원가입 이메일 인증코드가 전송되었습니다.' };
  }

  @HttpCode(200)
  @Post('/email-verification/password')
  @ApiOperation({ summary: '비밀번호 재설정 이메일 인증코드 전송' })
  async sendPasswordResetCode(@Body('email') email: string) {
    await this.usersService.sendPasswordResetCode(email);
    return { message: '비밀번호 재설정 이메일 인증코드가 전송되었습니다.' };
  }

  @HttpCode(200)
  @Post('/email-verification/confirm')
  @ApiOperation({ summary: '이메일 인증코드 확인' })
  async verifyEmail(
    @Body('email') email: string,
    @Body('verificationCode') verificationCode: number,
  ) {
    const result = await this.usersService.verifyEmail(email, verificationCode);
    return { verified: result };
  }

  @Get('/nickname-check/:nickname')
  @ApiOperation({ summary: '닉네임 중복 확인' })
  async checkNickname(@Param('nickname') nickname: string) {
    const result = await this.usersService.checkNickname(nickname);
    return { available: result };
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '회원 정보 조회' })
  async findOne(@Req() request: RequestWithUser) {
    const { user } = request;
    user.credential.password = undefined;
    return user;
  }

  @Patch('/nickname')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '닉네임 수정' })
  async updateNickname(
    @Req() request: RequestWithUser,
    @Body('nickname') nickname: string,
  ) {
    await this.usersService.updateNickname(request.user, nickname);
    return { message: '닉네임이 변경되었습니다.' };
  }

  @Patch('/verification/:impUid')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '본인 인증' })
  async updateVerificationStatus(
    @Req() request: RequestWithUser,
    @Param('impUid') impUid: string,
  ) {
    return await this.usersService.updateVerificationStatus(
      request.user,
      impUid,
    );
  }

  @Delete()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '회원 탈퇴' })
  async remove(
    @Req() request: RequestWithUser,
    @Body() exitReasonDto: ExitReasonDto,
  ) {
    const { user } = request;
    await this.usersService.remove(user.id, exitReasonDto);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
}
