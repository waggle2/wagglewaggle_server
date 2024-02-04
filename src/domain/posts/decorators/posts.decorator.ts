import { ApiQuery } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import {
  PageQuery,
  PageSizeQuery,
} from '@/@types/decorators/pagination.decorator';

export function FindAllDecorator() {
  return applyDecorators(
    ApiQuery({
      name: 'text',
      required: false,
      description: '검색할 제목이나 내용의 텍스트',
      example: '맛집',
    }),
    ApiQuery({
      name: 'animal',
      required: false,
      description: '검색할 게시글 동물',
      example: '여우',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      description: '검색할 게시글 카테고리',
      example: '연애',
    }),
    ApiQuery({
      name: 'tags',
      required: false,
      description: '검색할 게시글 태그 목록',
      isArray: true,
      example: ['조언해줘', '수다수다'],
    }),
    PageQuery(),
    PageSizeQuery,
  );
}
