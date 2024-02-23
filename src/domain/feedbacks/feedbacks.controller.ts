import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  Patch,
} from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';
import { HttpResponse } from '@/@types/http-response';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { Feedback } from '@/domain/feedbacks/entities/feedback.entity';
import {
  FeedbackNotFoundException,
  NotAdminNoPermissionException,
} from '@/domain/feedbacks/exceptions/feedbacks.exception';
import { UserUnauthorizedException } from '@/domain/authentication/exceptions/authentication.exception';

@Controller('feedbacks')
@ApiTags('feedbacks')
@ApiUnauthorizedResponse({
  type: UserUnauthorizedException,
  description: '로그인이 필요합니다',
})
@UseGuards(JwtAuthenticationGuard)
export class FeedbacksController {
  constructor(private readonly feedbackService: FeedbacksService) {}

  @ApiOperation({ summary: '건의사항 생성' })
  @ApiResponse({
    status: 201,
    description: '건의사항 생성 성공',
    type: Feedback,
  })
  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    const { user } = req;
    const feedback = await this.feedbackService.create(user, createFeedbackDto);
    return HttpResponse.created('건의사항 생성 성공', feedback);
  }

  @ApiOperation({ summary: '전체 건의사항 조회' })
  @ApiResponse({
    status: 200,
    description: '전체 건의사항 조회 성공',
    type: Feedback,
    isArray: true,
  })
  @ApiForbiddenResponse({
    type: NotAdminNoPermissionException,
    description: '관리자만 조회할 수 있습니다',
  })
  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const { user } = req;
    const { feedbacks, total } = await this.feedbackService.findAll(
      user,
      pageOptionsDto,
    );
    const { data, meta } = new PageDto(
      feedbacks,
      new PageMetaDto(pageOptionsDto, total),
    );

    return HttpResponse.success('전체 건의사항 조회 성공', data, meta);
  }

  @ApiOperation({ summary: '로그인한 유저의 건의사항 조회' })
  @ApiResponse({
    status: 200,
    description: '건의사항 조회 성공',
    type: Feedback,
    isArray: true,
  })
  @Get('self')
  async findByCurrentUser(@Req() req: RequestWithUser) {
    const { user } = req;
    const feedbacks = await this.feedbackService.findByCurrentUser(user);
    return HttpResponse.success('건의사항 조회 성공', feedbacks);
  }

  @ApiOperation({ summary: '건의사항 완료 처리' })
  @ApiResponse({
    status: 200,
    description: '건의사항 완료 처리 성공',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '건의사항 완료 처리 성공' },
      },
    },
  })
  @ApiForbiddenResponse({
    type: NotAdminNoPermissionException,
    description: '관리자만 완료 처리할 수 있습니다',
  })
  @ApiNotFoundResponse({
    description: '해당 건의사항을 찾을 수 없습니다',
    type: FeedbackNotFoundException,
  })
  @Patch(':id')
  async markAsResolved(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    await this.feedbackService.markAsResolved(user, +id);
    return HttpResponse.success('건의사항 완료 처리 성공');
  }
}
