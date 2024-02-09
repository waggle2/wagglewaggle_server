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
  ApiTags,
} from '@nestjs/swagger';
import { Comment } from '@/domain/comments/entities/comment.entity';
import { PostNotFoundException } from '@/domain/posts/exceptions/posts.exception';
import {
  CommentBadRequestException,
  CommentNotFoundException,
} from '@/domain/comments/exceptions/comments.exception';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';

@Controller('comments')
@ApiTags('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: '댓글 생성' })
  @ApiCreatedResponse({
    type: Comment,
    description: '댓글 생성 성공',
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
    return await this.commentsService.create(user, +postId, createCommentDto);
  }

  @ApiOperation({ summary: '대댓글 생성' })
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @UseGuards(JwtAuthenticationGuard)
  @Post('/reply/:commentId')
  async addReply(
    @Req() req: RequestWithUser,
    @Param('commentId') commentId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { user } = req;
    return await this.commentsService.addReply(
      user,
      +commentId,
      createCommentDto,
    );
  }

  @ApiOperation({ summary: '전체 댓글 조회 및 게시글별 댓글 조회' })
  @ApiOkResponse({
    type: Array<Comment>,
  })
  @ApiNotFoundResponse({
    type: PostNotFoundException,
  })
  @ApiQuery({
    name: 'postId',
    description:
      '쿼리 파라미터로 게시글 아이디를 넘겨 해당하는 댓글 목록을 조회합니다',
  })
  @Get()
  async findAll(@Query('postId') postId: number) {
    if (postId) return await this.commentsService.findCommentsByPostId(postId);
    return await this.commentsService.findAll();
  }

  @ApiOperation({ summary: '단일 댓글 조회' })
  @ApiOkResponse({
    type: Comment,
  })
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.commentsService.findOne(+id);
  }

  @ApiOperation({ summary: '댓글 수정' })
  @ApiOkResponse({
    type: Comment,
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const { user } = req;
    return await this.commentsService.update(user, +id, updateCommentDto);
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @ApiOkResponse({
    type: String,
  })
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    await this.commentsService.remove(user, +id);
    return { message: '댓글이 성공적으로 삭제되었습니다' };
  }

  @ApiOperation({ summary: '댓글 여러 개 삭제' })
  @ApiOkResponse({
    type: String,
  })
  @ApiBadRequestResponse({
    type: CommentBadRequestException,
  })
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
  })
  @ApiQuery({
    description: '삭제할 댓글 아이디 리스트',
    name: 'ids',
    example: [1, 2],
    type: Array<number>,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete()
  async removeMany(@Req() req: RequestWithUser, @Query('ids') ids: number[]) {
    const { user } = req;
    const idsStr = ids.map((id) => +id);

    await this.commentsService.removeMany(user, idsStr);

    return { message: '댓글이 성공적으로 삭제되었습니다' };
  }
}
