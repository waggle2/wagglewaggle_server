import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';
import { HttpResponse } from '@/@types/http-response';
import { ReportResponseDto } from '@/domain/reports/dto/report-response.dto';
import { PaginationSuccessResponse } from '@/common/decorators/pagination-success-response.decorator';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { PostNotFoundException } from '@/domain/posts/exceptions/posts.exception';
import { CommentNotFoundException } from '@/domain/comments/exceptions/comments.exception';
import {
  MessageBadRequestException,
  MessageNotFoundException,
  MessageRoomNotFoundException,
} from '../messages/exceptions/message.exception';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { AuthorityName } from '@/@types/enum/user.enum';
import { Roles } from '../authentication/decorators/role.decorator';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: '게시글 신고' })
  @ApiResponse({
    status: 201,
    description: '신고 접수 성공',
    type: ReportResponseDto,
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
    description: '게시글을 찾을 수 없습니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('/posts/:postId')
  async reportPost(
    @Req() req: RequestWithUser,
    @Param('postId') postId: string,
    @Body() createReportDto: CreateReportDto,
  ) {
    const { user } = req;
    const report = await this.reportsService.reportPost(
      user,
      +postId,
      createReportDto,
    );

    return HttpResponse.created(
      '신고 접수 성공',
      new ReportResponseDto(report),
    );
  }

  @ApiOperation({ summary: '댓글 신고' })
  @ApiResponse({
    status: 201,
    description: '신고 접수 성공',
    type: ReportResponseDto,
  })
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
    description: '댓글을 찾을 수 없습니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('/comments/:commentId')
  async reportComment(
    @Req() req: RequestWithUser,
    @Param('commentId') commentId: string,
    @Body() createReportDto: CreateReportDto,
  ) {
    const { user } = req;
    const report = await this.reportsService.reportComment(
      user,
      +commentId,
      createReportDto,
    );

    return HttpResponse.created(
      '신고 접수 성공',
      new ReportResponseDto(report),
    );
  }

  @ApiOperation({ summary: '채팅방 신고' })
  @ApiResponse({
    status: 201,
    description: '신고 접수 성공',
    type: ReportResponseDto,
  })
  @ApiNotFoundResponse({
    type: MessageRoomNotFoundException,
    description: '채팅방을 찾을 수 없습니다.',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('/messages/:messageRoomId')
  async reportMessageRoom(
    @Req() req: RequestWithUser,
    @Param('messageRoomId') messageRoomId: string,
    @Body() createReportDto: CreateReportDto,
  ) {
    const report = await this.reportsService.reportMessageRoom(
      req.user,
      +messageRoomId,
      createReportDto,
    );

    return HttpResponse.created(
      '신고 접수 성공',
      new ReportResponseDto(report),
    );
  }

  @ApiOperation({ summary: '받은 쪽지 신고' })
  @ApiResponse({
    status: 201,
    description: '신고 접수 성공',
    type: ReportResponseDto,
  })
  @ApiNotFoundResponse({
    type: MessageNotFoundException,
    description: '해당 메세지를 찾을 수 없습니다.',
  })
  @ApiBadRequestResponse({
    type: MessageBadRequestException,
    description: '신고한 유저가 받은 메세지가 아닙니다.',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('/messages/message/:messageId')
  async reportMessage(
    @Req() req: RequestWithUser,
    @Param('messageId') messageId: string,
    @Body() createReportDto: CreateReportDto,
  ) {
    const report = await this.reportsService.reportMessage(
      req.user,
      +messageId,
      createReportDto,
    );

    return HttpResponse.created(
      '신고 접수 성공',
      new ReportResponseDto(report),
    );
  }

  @ApiOperation({ summary: '신고 전체 조회' })
  @PaginationSuccessResponse(HttpStatus.OK, {
    model: PageDto,
    message: '신고 전체 조회에 성공했습니다',
    generic: ReportResponseDto,
  })
  @Get()
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(AuthorityName.ADMIN)
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    const { reports, total } =
      await this.reportsService.findAll(pageOptionsDto);
    const { data, meta } = new PageDto(
      reports.map((report) => new ReportResponseDto(report)),
      new PageMetaDto(pageOptionsDto, total),
    );

    return HttpResponse.success('신고 전체 조회에 성공했습니다', data, meta);
  }

  @ApiOperation({ summary: '신고 단일 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: ReportResponseDto,
  })
  @Get(':id')
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(AuthorityName.ADMIN)
  async findOne(@Param('id') id: string) {
    const report = await this.reportsService.findOne(+id);

    return HttpResponse.success('조회 성공', new ReportResponseDto(report));
  }
}
