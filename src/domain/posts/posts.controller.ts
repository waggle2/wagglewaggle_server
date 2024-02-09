import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
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
import { Tag } from '@/@types/enum/tags.enum';
import { Animal } from '@/@types/enum/animal.enum';
import { FindAllDecorator } from '@/domain/posts/decorators/posts.decorator';
import {
  PageQuery,
  PageSizeQuery,
} from '@/@types/decorators/pagination.decorator';
import { PostNotFoundException } from '@/domain/posts/exceptions/posts.exception';
import { Post as PostEntity } from './entities/post.entity';
import { Category } from '@/@types/enum/category.enum';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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

  @ApiOperation({ summary: '게시글 생성' })
  @ApiCreatedResponse({
    type: PostEntity,
    description: '게시글이 성공적으로 생성되었습니다',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  // @UseGuards(JwtAuthenticationGuard)
  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    const { user } = req;
    return await this.postsService.create(user, createPostDto);
  }

  @ApiOperation({ summary: '게시글 수정' })
  @ApiOkResponse({
    type: Post,
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: PostNotFoundException,
  })
  // @UseGuards(JwtAuthenticationGuard)
  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const { user } = req;
    return await this.postsService.update(user, +id, updatePostDto);
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @ApiOkResponse({
    type: String,
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
  })
  // @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    await this.postsService.remove(user, +id);
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
  // @UseGuards(JwtAuthenticationGuard)
  @Delete()
  async removeMany(@Req() req: RequestWithUser, @Query('ids') ids: number[]) {
    const { user } = req;
    const idsStr = ids.map((id) => +id);

    await this.postsService.removeMany(user, idsStr);

    return { message: '게시글이 성공적으로 삭제되었습니다' };
  }
}

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: '좋아요' })
  @ApiCreatedResponse({
    type: String,
    description: '좋아요 성공',
  })
  // @UseGuards(JwtAuthenticationGuard)
  @Post(':postId')
  async likePost(@Req() req: RequestWithUser, @Param('postId') postId: string) {
    const { user } = req;
    await this.postsService.likePost(user, +postId);
    return { message: '성공적으로 처리되었습니다' };
  }

  @ApiOperation({
    summary: '좋아요 취소',
    description: '좋아요 아이디를 받아 삭제합니다',
  })
  @ApiOkResponse({
    type: String,
    description: '좋아요 취소 성공',
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
    description: '존재하지 않는 게시글입니다',
  })
  // @UseGuards(JwtAuthenticationGuard)
  @Delete(':postId')
  async cancelLike(
    @Req() req: RequestWithUser,
    @Param('postId') postId: string,
  ) {
    const { user } = req;
    await this.postsService.cancelLike(user, +postId);
    return { message: '좋아요가 취소되었습니다.' };
  }
}
