import {
  Controller,
  Get,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { SearchHistoriesService } from './search-histories.service';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchHistory } from '@/domain/search-histories/entities/search-history.entity';
import { HttpResponse } from '@/@types/http-response';
import { SearchHistoryDifferentUserException } from '@/domain/search-histories/exceptions/search-histories.exception';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { PaginationSuccessResponse } from '@/common/decorators/pagination-success-response.decorator';

@Controller('search-histories')
@ApiTags('search-histories')
export class SearchHistoriesController {
  constructor(
    private readonly searchHistoriesService: SearchHistoriesService,
  ) {}

  @ApiOperation({
    summary: '현재 사용자의 검색 히스토리 조회',
  })
  @PaginationSuccessResponse(HttpStatus.OK, {
    model: PageDto,
    message: '검색 히스토리 조회 성공',
    generic: SearchHistory,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  async findByCurrentUser(
    @Req() req: RequestWithUser,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const { user } = req;
    const [searchHistories, total] =
      await this.searchHistoriesService.findByCurrentUser(user, pageOptionsDto);

    const { data, meta } = new PageDto(
      searchHistories,
      new PageMetaDto(pageOptionsDto, total),
    );

    return HttpResponse.success('검색 히스토리 조회 성공', data, meta);
  }

  @ApiOperation({ summary: '현재 사용자의 검색 히스토리 삭제' })
  @ApiResponse({
    status: 200,
    description: '검색 히스토리 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '검색 히스토리 삭제 성공',
        },
      },
    },
  })
  @ApiForbiddenResponse({
    type: SearchHistoryDifferentUserException,
    description: '다른 사용자의 검색 히스토리는 삭제할 수 없습니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    await this.searchHistoriesService.remove(user, +id);
    return HttpResponse.success('검색 히스토리 삭제 성공');
  }

  @ApiOperation({ summary: '현재 사용자의 검색 히스토리 전체 삭제' })
  @ApiResponse({
    status: 200,
    description: '검색 히스토리 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '검색 히스토리 삭제 성공',
        },
      },
    },
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete()
  async removeAllByCurrentUser(@Req() req: RequestWithUser) {
    const { user } = req;
    await this.searchHistoriesService.removeAllByCurrentUser(user);
    return HttpResponse.success('검색 히스토리 삭제 성공');
  }
}
