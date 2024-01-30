import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('/posts/:postId')
  @ApiOperation({ summary: '게시글 신고' })
  async reportPost(
    @Param('postId') postId: string,
    @Body() createReportDto: CreateReportDto,
    // Todo: user 추가
    // user
  ) {
    return await this.reportsService.reportPost(+postId, createReportDto);
  }

  @Post('/comments/:commentId')
  @ApiOperation({ summary: '댓글 신고' })
  async reportComment(
    @Param('commentId') commentId: string,
    @Body() createReportDto: CreateReportDto,
    // Todo: user 추가
    // user
  ) {
    return await this.reportsService.reportComment(+commentId, createReportDto);
  }

  @Get()
  @ApiOperation({ summary: '신고 전체 조회' })
  findAll() {
    return this.reportsService.findAll();
  }

  @ApiOperation({ summary: '신고 단일 조회' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }
}
