import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: '게시글 생성' })
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: '전체 게시글 조회' })
  async findAll() {
    return await this.postsService.findAll();
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
