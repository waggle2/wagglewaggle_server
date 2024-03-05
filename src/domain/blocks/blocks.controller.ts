import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '../authentication/guards/jwt-authentication.guard';
import RequestWithUser from '../authentication/interfaces/request-with-user.interface';
import { UserNotFoundException } from '../users/exceptions/users.exception';
import { HttpResponse } from '@/@types/http-response';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PaginationSuccessResponse } from '@/common/decorators/pagination-success-response.decorator';
import { BlockBadRequestException } from './exceptions/block.exception';
import { UserProfileDto } from '@/domain/users/dto/user-profile.dto';

@Controller('blocks')
@ApiTags('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '유저 차단' })
  @ApiResponse({
    status: 201,
    description: '차단 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '유저 차단이 완료되었습니다.' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: UserNotFoundException,
    description: '사용자를 찾을 수 없습니다.',
  })
  @ApiBadRequestResponse({
    type: BlockBadRequestException,
    description: '이미 차단된 사용자입니다.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: '77e88f4b-5ff5-47f9-9b3b-b1757c491cbb',
    description: '차단할 유저 아이디',
    required: true,
  })
  async createBlock(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.blocksService.createBlock(req.user, id);
    return HttpResponse.created('유저 차단이 완료되었습니다.');
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '현재 로그인한 유저가 차단한 목록 조회' })
  @PaginationSuccessResponse(HttpStatus.OK, {
    model: PageDto,
    message: '유저가 차단한 목록 조회에 성공했습니다.',
    generic: UserProfileDto,
  })
  async getBlockedUsers(
    @Req() req: RequestWithUser,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const [blockedUsers, total] =
      await this.blocksService.getBlockedUsersByCurrentUser(
        req.user,
        pageOptionsDto,
      );
    const { data, meta } = new PageDto(
      blockedUsers.map((blockedUser) => new UserProfileDto(blockedUser)),
      new PageMetaDto(pageOptionsDto, total),
    );

    return HttpResponse.success(
      '유저가 차단한 목록 조회에 성공했습니다.',
      data,
      meta,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '유저 차단 해제' })
  @ApiResponse({
    status: 200,
    description: '차단이 해제되었습니다.',
  })
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.blocksService.remove(req.user, id);
    return HttpResponse.success('차단이 해제되었습니다.');
  }
}
