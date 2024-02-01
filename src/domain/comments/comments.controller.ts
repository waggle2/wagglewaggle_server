import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  ApiTags,
} from '@nestjs/swagger';
import { Comment } from '@/domain/comments/entities/comment.entity';
import { PostNotFoundException } from '@/exceptions/domain/posts.exception';

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
  @Post(':postId')
  async create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.commentsService.create(+postId, createCommentDto);
  }

  @ApiOperation({ summary: '대댓글 생성' })
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @Post('/reply/:commentId')
  async addReply(
    @Param('commentId') commentId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.commentsService.addReply(+commentId, createCommentDto);
  }

  @ApiOperation({ summary: '전체 댓글 조회' })
  @ApiOkResponse()
  @Get()
  async findAll() {
    return await this.commentsService.findAll();
  }

  @ApiOperation({ summary: '단일 댓글 조회' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.commentsService.findOne(+id);
  }

  @ApiOperation({ summary: '댓글 수정' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return await this.commentsService.update(+id, updateCommentDto);
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.commentsService.remove(+id);
    return { message: '댓글이 성공적으로 삭제되었습니다' };
  }
}
