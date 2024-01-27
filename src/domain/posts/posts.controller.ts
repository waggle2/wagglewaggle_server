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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Tag } from '@/domain/types/enum/tags.enum';
import { Animal } from '@/domain/types/enum/animal.enum';
import {
  PageQuery,
  PageSizeQuery,
} from '@/domain/types/decorators/pagination.decorator';
import {
  AnimalQuery,
  GetAllPostsOperation,
  TagsQuery,
} from '@/domain/posts/decorators/posts.decorator';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: '게시글 생성' })
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto);
  }

  @AnimalQuery()
  @TagsQuery()
  @PageQuery()
  @PageSizeQuery()
  @GetAllPostsOperation()
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
