import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockUserDto } from './dto/create-block-user.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '../authentication/guards/jwt-authentication.guard';
import RequestWithUser from '../authentication/interfaces/request-with-user.interface';
import { UserNotFoundException } from '../users/exceptions/users.exception';
import { BlockResponseDto } from './dto/block-response.dto';
import { HttpResponse } from '@/@types/http-response';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PaginationSuccessResponse } from '@/common/decorators/pagination-success-response.decorator';
import { BlockBadRequestException } from './exceptions/block.exception';

@Controller('blocks')
@ApiTags('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '유저 차단' })
  @ApiResponse({
    status: 201,
    description: '차단 성공',
    schema: {
      type: 'object',
      properties: {
        createdAt: { type: 'string', format: 'date-time' },
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
  async createBlock(
    @Req() req: RequestWithUser,
    @Body() createBlockUserDto: CreateBlockUserDto,
  ) {
    const { blockedUserId } = createBlockUserDto;
    const block = await this.blocksService.createBlock(req.user, blockedUserId);
    return HttpResponse.created('유저 차단이 완료되었습니다.', block.createdAt);
  }

  @Get('users/:userId')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '해당 유저가 차단한 목록 조회 (관리자)' })
  @PaginationSuccessResponse(HttpStatus.OK, {
    model: PageDto,
    message: '유저가 차단한 목록 조회에 성공했습니다.',
    generic: BlockResponseDto,
  })
  async getBlockedUsers(
    @Req() req: RequestWithUser,
    @Param('userId') blockedBy: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const { blocks, total } = await this.blocksService.getBlockedUsers(
      req.user,
      blockedBy,
      pageOptionsDto,
    );
    const { data, meta } = new PageDto(
      blocks.map((block) => new BlockResponseDto(block)),
      new PageMetaDto(pageOptionsDto, total),
    );
    return HttpResponse.success(
      '유저가 차단한 목록 조회에 성공했습니다.',
      data,
      meta,
    );
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '유저 차단 전체 조회 (관리자)' })
  @PaginationSuccessResponse(HttpStatus.OK, {
    model: PageDto,
    message: '차단 전체 조회에 성공했습니다',
    generic: BlockResponseDto,
  })
  async findAll(
    @Req() req: RequestWithUser,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const { blocks, total } = await this.blocksService.findAll(
      req.user,
      pageOptionsDto,
    );
    const { data, meta } = new PageDto(
      blocks.map((block) => new BlockResponseDto(block)),
      new PageMetaDto(pageOptionsDto, total),
    );
    return HttpResponse.success('차단 전체 조회에 성공했습니다.', data, meta);
  }

  @Get(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '유저 차단 단일 조회 (관리자)' })
  @ApiResponse({
    status: 200,
    description: '차단 단일 조회에 성공했습니다.',
    type: BlockResponseDto,
  })
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    const block = await this.blocksService.findOne(req.user, +id);
    return HttpResponse.success(
      '차단 단일 조회에 성공했습니다.',
      new BlockResponseDto(block),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '유저 차단 삭제' })
  @ApiResponse({
    status: 200,
    description: '차단이 삭제되었습니다.',
  })
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.blocksService.remove(req.user, +id);
    return HttpResponse.success('차단이 삭제되었습니다.');
  }
}
