import {
  Controller,
  Post,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
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
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @ApiOperation({ summary: '좋아요' })
  @ApiCreatedResponse({
    type: Like,
    description: '좋아요 성공',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post(':postId')
  async create(@Req() req: RequestWithUser, @Param('postId') postId: string) {
    const { user } = req;
    return await this.likesService.create(user, +postId);
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
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    await this.likesService.remove(user, +id);
    return { message: '좋아요가 취소되었습니다.' };
  }
}
