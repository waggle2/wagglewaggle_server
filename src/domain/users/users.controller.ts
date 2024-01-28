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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from '../authentication/guards/jwt-authentication.guard';
import RequestWithUser from '../authentication/interfaces/request-with-user.interface';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(200)
  @Post('/email-verification')
  @ApiOperation({ summary: '이메일 인증코드 전송' })
  async sendVerificationCode(@Body() email: string) {
    return await this.usersService.sendSignupCode(email);
  }

  @HttpCode(200)
  @Post('/email-verification/confirm')
  @ApiOperation({ summary: '이메일 인증코드 확인' })
  async verifyEmail(@Body() email: string, verificationCode: number) {
    return await this.usersService.verifyEmail(email, verificationCode);
  }

  @Get('/nickname-check')
  @ApiOperation({ summary: '닉네임 중복 확인' })
  async checkNickname(@Body() nickname: string) {
    return await this.usersService.checkNickname(nickname);
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
    @Body() nickname: string,
  ) {
    return await this.usersService.updateNickname(request.user, nickname);
  }

  @Delete()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '회원 탈퇴' })
  async remove(@Req() request: RequestWithUser) {
    const { user } = request;
    return await this.usersService.remove(user.id);
  }
}
