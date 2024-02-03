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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Tag } from '@/domain/types/enum/tags.enum';
import { Animal } from '@/domain/types/enum/animal.enum';
import { FindAllDecorator } from '@/domain/posts/decorators/posts.decorator';
import {
  PageQuery,
  PageSizeQuery,
} from '@/domain/types/decorators/pagination.decorator';
import { PostNotFoundException } from '@/exceptions/domain/posts.exception';
import { Post as PostEntity } from './entities/post.entity';
import { Category } from '@/domain/types/enum/category.enum';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: '게시글 생성' })
  @ApiCreatedResponse({
    type: PostEntity,
    description: '게시글이 성공적으로 생성되었습니다',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Post()
  async create(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    return await this.postsService.create(createPostDto);
  }

  @ApiOperation({
    summary: '전체 게시글 조회 및 검색',
    description: '쿼리 파라미터를 통해 게시물을 조회 또는 검색합니다',
  })
  @ApiOkResponse({
    type: Array<PostEntity>,
    description: '게시물 목록을 불러오는 데 성공했습니다',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @FindAllDecorator()
  @Get()
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('tags') tags: Tag | Tag[],
    @Query('category') category: Category,
    @Query('text') text: string,
    @Query('animal')
    animal: Animal,
  ) {
    return await this.postsService.findAll(
      text,
      animal,
      category,
      tags,
      page,
      pageSize,
    );
  }

  @ApiOperation({ summary: '인기 게시글 조회' })
  @ApiOkResponse({
    type: Array<PostEntity>,
  })
  @PageQuery()
  @PageSizeQuery()
  @Get('/hot-posts')
  async findHotPosts(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return await this.postsService.findHotPosts(page, pageSize);
  }

  @ApiOperation({ summary: '삭제된 게시글 조회' })
  @ApiOkResponse({
    type: Array<PostEntity>,
  })
  @PageQuery()
  @PageSizeQuery()
  @Get('/deleted-posts')
  async findDeletedPosts(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return await this.postsService.findDeletedPosts(page, pageSize);
  }

  @ApiOperation({ summary: '단일 게시글 조회' })
  @ApiOkResponse({
    type: Post,
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.postsService.findOne(+id);
  }

  @ApiOperation({ summary: '게시글 수정' })
  @ApiOkResponse({
    type: Post,
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: PostNotFoundException,
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return await this.postsService.update(+id, updatePostDto);
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @ApiOkResponse({
    type: String,
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.postsService.remove(+id);
    return { message: '게시글이 성공적으로 삭제되었습니다' };
  }

  @ApiOperation({ summary: '게시글 여러 개 삭제' })
  @ApiOkResponse({
    type: String,
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
  })
  @ApiQuery({
    description: '삭제할 게시글 아이디 리스트',
    name: 'ids',
    example: [1, 2],
    type: Array<number>,
  })
  @Delete()
  async removeMany(@Query('ids') ids: number[]) {
    await this.postsService.removeMany(ids);
    return { message: '게시글이 성공적으로 삭제되었습니다' };
  }
}
