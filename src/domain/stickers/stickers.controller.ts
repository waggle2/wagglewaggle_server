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
  ApiTags,
} from '@nestjs/swagger';
import { Sticker } from '@/domain/stickers/entities/sticker.entity';
import { CommentNotFoundException } from '@/domain/comments/exceptions/comments.exception';
import { JwtAuthenticationGuard } from '@/domain/authentication/guards/jwt-authentication.guard';
import RequestWithUser from '@/domain/authentication/interfaces/request-with-user.interface';
import { StickerNotFoundException } from '@/domain/stickers/exceptions/stickers.exception';

@ApiTags('stickers')
@Controller('stickers')
export class StickersController {
  constructor(private readonly stickerService: StickersService) {}

  @ApiOperation({ summary: '스티커 생성' })
  @ApiCreatedResponse({
    type: Sticker,
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    type: CommentNotFoundException,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post(':commentId')
  async create(
    @Req() req: RequestWithUser,
    @Param('commentId') commentId: number,
    @Body() createStickerDto: CreateStickerDto,
  ) {
    const { user } = req;
    return await this.stickerService.create(user, commentId, createStickerDto);
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
  @UseGuards(JwtAuthenticationGuard)
  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateStickerDto: UpdateStickerDto,
  ) {
    const { user } = req;
    return await this.stickerService.update(user, +id, updateStickerDto);
  }

  @ApiOperation({ summary: '스티커 삭제' })
  @ApiOkResponse({
    type: Sticker,
  })
  @ApiNotFoundResponse({
    type: StickerNotFoundException,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const { user } = req;
    await this.stickerService.remove(user, +id);
    return { message: '스티커가 성공적으로 삭제되었습니다.' };
  }
}
