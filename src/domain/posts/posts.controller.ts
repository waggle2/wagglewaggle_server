import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Tag } from '@/domain/types/enum/tags.enum';
import { Animal } from '@/domain/types/enum/animal.enum';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: '게시글 생성' })
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto);
  }

  @ApiQuery({
    name: 'animal',
    required: false,
    description: '검색할 게시글 동물',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: '검색할 게시글 태그 목록',
    type: Array<Tag>,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '페이지당 게시글 개수',
    type: Number,
  })
  @ApiOperation({ summary: '전체 게시글 조회' })
  @Get()
  async findAll(
    @Query('page') page: number = 0,
    @Query('pageSize') pageSize: number = 20,
    @Query('tags') tags: Tag | Tag[],
    @Query('animal')
    animal: Animal,
  ) {
    return await this.postsService.findAll(animal, tags, { page, pageSize });
  }

  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '페이지당 게시글 개수',
    type: Number,
  })
  @ApiOperation({ summary: '인기 게시글 조회' })
  @Get('/hot-posts')
  async findHotPosts(
    @Query('page') page: number = 0,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return await this.postsService.findHotPosts({ page, pageSize });
  }

  @Get(':id')
  @ApiOperation({ summary: '단일 게시글 조회' })
  async findOne(@Param('id') id: string) {
    return await this.postsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '게시글 수정' })
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return await this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '게시글 삭제' })
  async remove(@Param('id') id: string) {
    return await this.postsService.remove(+id);
  }
}
