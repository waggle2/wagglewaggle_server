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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('comments')
@ApiTags('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId')
  @ApiOperation({ summary: '댓글 생성' })
  create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(+postId, createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: '전체 댓글 조회' })
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '단일 댓글 조회' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '댓글 수정' })
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '댓글 삭제' })
  remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }
}
