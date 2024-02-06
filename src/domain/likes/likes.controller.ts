import { Controller, Post, Param, Delete } from '@nestjs/common';
import { LikesService } from './likes.service';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PostNotFoundException } from '@/domain/posts/exceptions/posts.exception';
import { Like } from '@/domain/likes/entities/like.entity';

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @ApiOperation({ summary: '좋아요' })
  @ApiCreatedResponse({
    type: Like,
    description: '좋아요 성공',
  })
  @Post(':postId')
  async create(@Param('postId') postId: number) {
    return await this.likesService.create(postId);
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
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.likesService.remove(+id);
    return { message: '좋아요가 취소되었습니다.' };
  }
}
