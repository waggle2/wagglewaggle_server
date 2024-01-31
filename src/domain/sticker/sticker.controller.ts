import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StickerService } from './sticker.service';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';

@Controller('stickers')
export class StickerController {
  constructor(private readonly stickerService: StickerService) {}

  @Post(':commentId')
  async create(
    @Param('commentId') commentId: number,
    @Body() createStickerDto: CreateStickerDto,
  ) {
    return await this.stickerService.create(commentId, createStickerDto);
  }

  @Get()
  async findAll() {
    return await this.stickerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.stickerService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStickerDto: UpdateStickerDto,
  ) {
    return await this.stickerService.update(+id, updateStickerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.stickerService.remove(+id);
    return { message: '스티커가 성공적으로 삭제되었습니다.' };
  }
}
