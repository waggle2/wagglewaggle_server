import { ApiQuery } from '@nestjs/swagger';

export function PageQuery() {
  return ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    type: Number,
  });
}

export function PageSizeQuery() {
  return ApiQuery({
    name: 'pageSize',
    required: false,
    description: '페이지당 게시글 개수',
    type: Number,
  });
}
