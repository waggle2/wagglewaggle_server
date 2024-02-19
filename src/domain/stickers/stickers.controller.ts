import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StickersService } from './stickers.service';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommentNotFoundException } from '@/domain/comments/exceptions/comments.exception';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';
import { StickerNotFoundException } from '@/domain/stickers/exceptions/stickers.exception';
import { HttpResponse } from '@/@types/http-response';
import { StickerResponseDto } from '@/domain/stickers/dto/sticker-response.dto';

@ApiTags('stickers')
@Controller('stickers')
export class StickersController {
  constructor(private readonly stickerService: StickersService) {}

  @ApiOperation({ summary: '스티커 생성' })
  @ApiCreatedResponse({
    description: '스티커가 성공적으로 생성되었습니다.',
    type: StickerResponseDto,
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
    description: '댓글을 찾을 수 없습니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post(':commentId')
  async create(
    @Req() req: RequestWithUser,
    @Param('commentId') commentId: number,
    @Body() createStickerDto: CreateStickerDto,
  ) {
    const { user } = req;
    const sticker = await this.stickerService.create(
      user,
      commentId,
      createStickerDto,
    );

    return HttpResponse.created(
      '스티커가 성공적으로 생성되었습니다.',
      new StickerResponseDto(sticker),
    );
  }

  @ApiOperation({
    summary: '스티커 수정',
    description: '다른 동물 스티커를 선택하고 싶을 때 사용합니다',
  })
  @ApiOkResponse({
    type: StickerResponseDto,
    description: '스티커가 성공적으로 수정되었습니다.',
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: StickerNotFoundException,
    description: '스티커를 찾을 수 없습니다',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateStickerDto: UpdateStickerDto,
  ) {
    const { user } = req;
    const sticker = await this.stickerService.update(
      user,
      +id,
      updateStickerDto,
    );

    return HttpResponse.success(
      '스티커가 성공적으로 수정되었습니다.',
      new StickerResponseDto(sticker),
    );
  }

  @ApiOperation({ summary: '스티커 삭제' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '스티커가 성공적으로 삭제되었습니다.',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: StickerNotFoundException,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    await this.stickerService.remove(user, +id);
    return HttpResponse.success('스티커가 성공적으로 삭제되었습니다.');
  }
}
