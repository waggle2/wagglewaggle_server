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
import { Request } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostNotFoundException } from '@/domain/posts/exceptions/posts.exception';
import {
  CommentBadRequestException,
  CommentNotFoundException,
} from '@/domain/comments/exceptions/comments.exception';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';
import { HttpResponse } from '@/@types/http-response';
import { CommentResponseDto } from '@/domain/comments/dto/comment-response.dto';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { CommentFindDto } from '@/domain/comments/dto/comment-find.dto';
import { getUserIdFromToken } from '@/common/utils/getUserIdFromToken';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Controller('comments')
@ApiTags('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: '댓글 생성' })
  @ApiCreatedResponse({
    description: '댓글이 작성되었습니다',
    type: CommentResponseDto,
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: PostNotFoundException,
    description: '존재하지 않는 게시물입니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post(':postId')
  async create(
    @Req() req: RequestWithUser,
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { user } = req;
    const comment = await this.commentsService.create(
      user,
      +postId,
      createCommentDto,
    );

    return HttpResponse.created(
      '댓글이 작성되었습니다',
      new CommentResponseDto(comment),
    );
  }

  @ApiOperation({ summary: '대댓글 생성' })
  @ApiCreatedResponse({
    description: '대댓글이 작성되었습니다',
    type: CommentResponseDto,
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
    description: '존재하지 않는 댓글입니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('/reply/:commentId')
  async addReply(
    @Req() req: RequestWithUser,
    @Param('commentId') commentId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { user } = req;
    const reply = await this.commentsService.addReply(
      user,
      +commentId,
      createCommentDto,
    );

    return HttpResponse.created(
      '대댓글이 작성되었습니다',
      new CommentResponseDto(reply),
    );
  }

  @ApiOperation({ summary: '전체 댓글 조회 및 게시글별 댓글 조회' })
  @ApiOkResponse({
    type: CommentResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
  })
  @Get()
  async findAll(
    @Req() req: Request,
    @Query() commentFindDto: CommentFindDto,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const userId = await getUserIdFromToken(
      req,
      this.configService,
      this.jwtService,
    );
    const { comments, total } = await this.commentsService.findAll(
      commentFindDto,
      pageOptionsDto,
      userId,
    );
    const { data, meta } = new PageDto(
      comments.map((comment) => new CommentResponseDto(comment)),
      new PageMetaDto(pageOptionsDto, total),
    );

    return HttpResponse.success('댓글 조회에 성공했습니다', data, meta);
  }

  @ApiOperation({ summary: '단일 댓글 조회' })
  @ApiOkResponse({
    type: CommentResponseDto,
    description: '댓글이 조회되었습니다',
  })
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
    description: '존재하지 않는 댓글입니다',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const comment = await this.commentsService.findOne(+id);

    return HttpResponse.success(
      '댓글이 조회되었습니다',
      new CommentResponseDto(comment),
    );
  }

  @ApiOperation({ summary: '댓글 수정' })
  @ApiOkResponse({
    type: CommentResponseDto,
    description: '댓글이 수정되었습니다',
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
    description: '존재하지 않는 댓글입니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const { user } = req;
    const comment = await this.commentsService.update(
      user,
      +id,
      updateCommentDto,
    );

    return HttpResponse.success(
      '댓글이 수정되었습니다',
      new CommentResponseDto(comment),
    );
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({
    status: 200,
    description: '댓글이 삭제되었습니다',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '댓글이 삭제되었습니다' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
    description: '존재하지 않는 댓글입니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    await this.commentsService.remove(user, +id);
    return HttpResponse.success('댓글이 삭제되었습니다');
  }

  @ApiOperation({ summary: '댓글 여러 개 삭제' })
  @ApiResponse({
    status: 200,
    description: '댓글이 삭제되었습니다',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '댓글이 삭제되었습니다' },
      },
    },
  })
  @ApiBadRequestResponse({
    type: CommentBadRequestException,
  })
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
    description: '존재하지 않는 댓글입니다',
  })
  @ApiQuery({
    description: '삭제할 댓글 아이디 리스트',
    name: 'ids',
    example: [1, 2],
    type: Array<number>,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete()
  async removeMany(@Query('ids') ids: number[]) {
    const idsStr = ids.map((id) => +id);
    await this.commentsService.removeMany(idsStr);

    return HttpResponse.success('댓글이 삭제되었습니다');
  }
}
