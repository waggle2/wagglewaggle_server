import { ApiOperation, ApiQuery } from '@nestjs/swagger';

export function AnimalQuery() {
  return ApiQuery({
    name: 'animal',
    required: false,
    description: '검색할 게시글 동물',
  });
}

export function TagsQuery() {
  return ApiQuery({
    name: 'tags',
    required: false,
    description: '검색할 게시글 태그 목록',
    isArray: true,
  });
}

export function GetAllPostsOperation() {
  return ApiOperation({ summary: '전체 게시글 조회' });
}
