import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StickerService } from './sticker.service';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Sticker } from '@/domain/sticker/entities/sticker.entity';
import { CommentNotFoundException } from '@/lib/exceptions/domain/comments.exception';
import { StickerNotFoundException } from '@/lib/exceptions/domain/stickers.exception';

@ApiTags('stickers')
@Controller('stickers')
export class StickerController {
  constructor(private readonly stickerService: StickerService) {}

  @ApiOperation({ summary: '스티커 생성' })
  @ApiCreatedResponse({
    type: Sticker,
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
  })
  @Post(':commentId')
  async create(
    @Param('commentId') commentId: number,
    @Body() createStickerDto: CreateStickerDto,
  ) {
    return await this.stickerService.create(commentId, createStickerDto);
  }

  @ApiOperation({
    summary: '스티커 수정',
    description: '다른 동물의 스티커를 선택하고 싶을 때 사용합니다',
  })
  @ApiOkResponse({
    type: Sticker,
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: StickerNotFoundException,
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStickerDto: UpdateStickerDto,
  ) {
    return await this.stickerService.update(+id, updateStickerDto);
  }

  @ApiOperation({ summary: '스티커 삭제' })
  @ApiOkResponse({
    type: Sticker,
  })
  @ApiNotFoundResponse({
    type: StickerNotFoundException,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.stickerService.remove(+id);
    return { message: '스티커가 성공적으로 삭제되었습니다.' };
  }
}
