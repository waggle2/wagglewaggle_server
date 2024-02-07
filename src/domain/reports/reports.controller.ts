import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: '게시글 신고' })
  @UseGuards(JwtAuthenticationGuard)
  @Post('/posts/:postId')
  async reportPost(
    @Req() req: RequestWithUser,
    @Param('postId') postId: string,
    @Body() createReportDto: CreateReportDto,
  ) {
    const { user } = req;
    return await this.reportsService.reportPost(user, +postId, createReportDto);
  }

  @ApiOperation({ summary: '댓글 신고' })
  @UseGuards(JwtAuthenticationGuard)
  @Post('/comments/:commentId')
  async reportComment(
    @Req() req: RequestWithUser,
    @Param('commentId') commentId: string,
    @Body() createReportDto: CreateReportDto,
  ) {
    const { user } = req;
    return await this.reportsService.reportComment(
      user,
      +commentId,
      createReportDto,
    );
  }

  @ApiOperation({ summary: '신고 전체 조회' })
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  findAll(@Req() req: RequestWithUser) {
    const { user } = req;
    return this.reportsService.findAll(user);
  }

  @ApiOperation({ summary: '신고 단일 조회' })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    return this.reportsService.findOne(user, +id);
  }
}
