import { Controller, Get, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { SearchHistoriesService } from './search-histories.service';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('search-histories')
@ApiTags('search-histories')
export class SearchHistoriesController {
  constructor(
    private readonly searchHistoriesService: SearchHistoriesService,
  ) {}

  @ApiOperation({ summary: '현재 사용자의 검색 히스토리 조회' })
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  findByCurrentUser(@Req() req: RequestWithUser) {
    const { user } = req;
    return this.searchHistoriesService.findByCurrentUser(user);
  }

  @ApiOperation({ summary: '현재 사용자의 검색 히스토리 삭제' })
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    return this.searchHistoriesService.remove(user, +id);
  }

  @ApiOperation({ summary: '현재 사용자의 검색 히스토리 전체 삭제' })
  @UseGuards(JwtAuthenticationGuard)
  @Delete()
  removeAllByCurrentUser(@Req() req: RequestWithUser) {
    const { user } = req;
    return this.searchHistoriesService.removeAllByCurrentUser(user);
  }
}
