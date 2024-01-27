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
  })
  @ApiOperation({ summary: '전체 게시글 조회' })
  @Get()
  async findAll(
    @Query('animal') animal: Animal,
    @Query('tags') tags: Tag | Tag[],
  ) {
    return await this.postsService.findAll(animal, tags);
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
