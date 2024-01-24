import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('categories')
@ApiTags('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: '전체 카테고리 조회' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '단일 카테고리 조회' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }
}
