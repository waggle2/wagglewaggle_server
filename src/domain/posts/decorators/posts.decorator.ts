import { ApiQuery } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import {
  PageQuery,
  PageSizeQuery,
} from '@/domain/types/decorators/pagination.decorator';

export function FindAllDecorator() {
  return applyDecorators(
    ApiQuery({
      name: 'animal',
      required: false,
      description: '검색할 게시글 동물',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      description: '검색할 게시글 카테고리',
    }),
    ApiQuery({
      name: 'tags',
      required: false,
      description: '검색할 게시글 태그 목록',
      isArray: true,
    }),
    PageQuery(),
    PageSizeQuery,
  );
}
