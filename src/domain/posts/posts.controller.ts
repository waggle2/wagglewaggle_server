import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostNotFoundException } from '@/domain/posts/exceptions/posts.exception';
import { Post as PostEntity } from './entities/post.entity';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';
import { HttpResponse } from '@/@types/http-response';
import {
  AlreadyLikeException,
  LikeDifferentUserException,
} from '@/domain/posts/exceptions/likes.exception';
import { PostFindDto } from '@/domain/posts/dto/post-find.dto';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PostEntryResponseDto } from '@/domain/posts/dto/post-entry-response.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { PaginationSuccessResponse } from '@/common/decorators/pagination-success-response.decorator';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: '전체 게시글 조회 및 검색',
    description: '쿼리 파라미터를 통해 게시물을 조회 또는 검색합니다',
  })
  @PaginationSuccessResponse(HttpStatus.OK, {
    model: PageDto,
    message: '게시글 조회에 성공했습니다',
    generic: PostEntryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @Get()
  async findAll(
    @Req() req: Request,
    @Query() postFindDto: PostFindDto,
    @Query() pageOptionDto: PageOptionsDto,
  ) {
    const accessToken = req.cookies.accessToken;
    const secret = this.configService.get('JWT_SECRET');
    const userId = (
      await this.jwtService.verifyAsync(accessToken, {
        secret,
      })
    ).id;

    const { posts, total } = await this.postsService.findAll(
      postFindDto,
      pageOptionDto,
      userId,
    );

    const { data, meta } = new PageDto(
      posts.map((post) => new PostEntryResponseDto(post)),
      new PageMetaDto(pageOptionDto, total),
    );

    return HttpResponse.success('게시글 조회에 성공했습니다', data, meta);
  }

  @ApiOperation({
    summary: '내가 작성한 글 조회',
    description: '내가 작성한 글을 조회합니다',
  })
  @PaginationSuccessResponse(HttpStatus.OK, {
    model: PageDto,
    message: '내가 작성한 글 조회에 성공했습니다',
    generic: PostEntryResponseDto,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('self')
  async findByUserId(
    @Req() req: RequestWithUser,
    @Query() pageOptionDto: PageOptionsDto,
  ) {
    const { user } = req;
    const { posts, total } = await this.postsService.findByUserId(
      user,
      pageOptionDto,
    );
    const { data, meta } = new PageDto(
      posts.map((post) => new PostEntryResponseDto(post)),
      new PageMetaDto(pageOptionDto, total),
    );

    return HttpResponse.success(
      '내가 작성한 글 조회에 성공했습니다',
      data,
      meta,
    );
  }

  @ApiOperation({
    summary: '내가 댓글 단 글 조회',
    description: '내가 댓글 단 글을 조회합니다',
  })
  @PaginationSuccessResponse(HttpStatus.OK, {
    model: PageDto,
    message: '내가 댓글 단 글 조회에 성공했습니다',
    generic: PostEntryResponseDto,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('self/comments')
  async findByComments(
    @Req() req: RequestWithUser,
    @Query() pageOptionDto: PageOptionsDto,
  ) {
    const { user } = req;
    const { posts, total } = await this.postsService.findByComments(
      user,
      pageOptionDto,
    );
    const { data, meta } = new PageDto(
      posts.map((post) => new PostEntryResponseDto(post)),
      new PageMetaDto(pageOptionDto, total),
    );

    return HttpResponse.success(
      '내가 댓글 단 글 조회에 성공했습니다',
      data,
      meta,
    );
  }

  @ApiOperation({ summary: '인기 게시글 조회' })
  @PaginationSuccessResponse(HttpStatus.OK, {
    model: PageDto,
    message: '인기 게시글 조회에 성공했습니다',
    generic: PostEntryResponseDto,
  })
  @Get('/hot-posts')
  async findHotPosts(@Query() pageOptionDto: PageOptionsDto) {
    const { posts, total } =
      await this.postsService.findHotPosts(pageOptionDto);
    const { data, meta } = new PageDto(
      posts.map((post) => new PostEntryResponseDto(post)),
      new PageMetaDto(pageOptionDto, total),
    );
    return HttpResponse.success('인기 게시글 조회에 성공했습니다', data, meta);
  }

  @ApiOperation({ summary: '삭제된 게시글 조회' })
  @PaginationSuccessResponse(HttpStatus.OK, {
    model: PageDto,
    message: '삭제된 게시글 조회에 성공했습니다',
    generic: PostEntryResponseDto,
  })
  @Get('/deleted-posts')
  async findDeletedPosts(@Query() pageOptionDto: PageOptionsDto) {
    const { posts, total } =
      await this.postsService.findDeletedPosts(pageOptionDto);
    const { data, meta } = new PageDto(
      posts.map((post) => new PostEntryResponseDto(post)),
      new PageMetaDto(pageOptionDto, total),
    );

    return HttpResponse.success(
      '삭제된 게시글 조회에 성공했습니다',
      data,
      meta,
    );
  }

  @ApiOperation({ summary: '단일 게시글 조회' })
  @ApiResponse({
    status: 200,
    description: '요청 성공시',
    type: PostEntity,
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOne(+id);
    return HttpResponse.success('게시글 정보가 조회되었습니다', post);
  }

  @ApiOperation({ summary: '게시글 생성' })
  @ApiCreatedResponse({
    type: PostEntity,
    description: '게시글 작성에 성공했습니다',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @UseGuards(JwtAuthenticationGuard)
  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createPostDto: CreatePostDto,
  ) {
    const { user } = req;
    const post = await this.postsService.create(user, createPostDto);
    return HttpResponse.created('게시글 작성에 성공했습니다', post);
  }

  @ApiOperation({ summary: '게시글 수정' })
  @ApiOkResponse({
    type: PostEntity,
    description: '게시글이 수정되었습니다',
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: PostNotFoundException,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const { user } = req;
    const post = await this.postsService.update(user, +id, updatePostDto);
    return HttpResponse.success('게시글이 수정되었습니다', post);
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @ApiOkResponse({
    description: '게시글이 삭제되었습니다',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '게시글이 삭제되었습니다' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    await this.postsService.remove(user, +id);
    return HttpResponse.success('게시글이 삭제되었습니다');
  }

  @ApiOperation({ summary: '게시글 여러 개 삭제' })
  @ApiOkResponse({
    description: '게시글이 삭제되었습니다',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '게시글이 삭제되었습니다' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
    description: '게시글이 존재하지 않습니다',
  })
  @ApiQuery({
    description: '삭제할 게시글 아이디 리스트',
    name: 'ids',
    example: [1, 2],
    type: Array<number>,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete()
  async removeMany(@Req() req: RequestWithUser, @Query('ids') ids: number[]) {
    const { user } = req;
    const idsStr = ids.map((id) => +id);

    await this.postsService.removeMany(user, idsStr);

    return HttpResponse.success('게시글이 삭제되었습니다');
  }
}

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: '좋아요' })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: '성공적으로 처리되었습니다',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
    description: '존재하지 않는 게시글입니다',
  })
  @ApiConflictResponse({
    type: AlreadyLikeException,
    description: '이미 좋아요를 누른 게시물입니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post(':postId')
  async likePost(@Req() req: RequestWithUser, @Param('postId') postId: string) {
    const { user } = req;
    await this.postsService.likePost(user, +postId);
    return HttpResponse.created('성공적으로 처리되었습니다');
  }

  @ApiOperation({
    summary: '좋아요 취소',
    description: '좋아요 아이디를 받아 삭제합니다',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '좋아요가 취소되었습니다',
        },
      },
    },
  })
  @ApiForbiddenResponse({
    type: () => LikeDifferentUserException,
    description: '잘못된 접근입니다',
  })
  @ApiNotFoundResponse({
    type: () => PostNotFoundException,
    description: '존재하지 않는 게시글입니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':postId')
  async cancelLike(
    @Req() req: RequestWithUser,
    @Param('postId') postId: string,
  ) {
    const { user } = req;
    await this.postsService.cancelLike(user, +postId);
    return HttpResponse.success('좋아요가 취소되었습니다.');
  }
}
