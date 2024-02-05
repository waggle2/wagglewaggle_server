import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sticker } from '@/domain/sticker/entities/sticker.entity';
import { Repository } from 'typeorm';
import { CommentsService } from '@/domain/comments/comments.service';

@Injectable()
export class StickerService {
  constructor(
    @InjectRepository(Sticker)
    private readonly stickersRepository: Repository<Sticker>,
    private readonly commentsService: CommentsService,
  ) {}

  async create(commentId: number, createStickerDto: CreateStickerDto) {
    const comment = await this.commentsService.findOne(commentId);
    console.log(comment);

    // 해당 comment에 user가 이미 sticker를 남겼으면 conflict

    const sticker = this.stickersRepository.create({
      ...createStickerDto,
      // user
      comment: { id: comment?.id },
    });
    return await this.stickersRepository.save(sticker);
  }

  async findAll() {
    return await this.stickersRepository.find();
  }

  async findOne(id: number) {
    return await this.stickersRepository.findOneBy({ id });
  }

  async update(id: number, updateStickerDto: UpdateStickerDto) {
    const existingSticker = await this.findOne(id);
    if (!existingSticker) {
      throw new NotFoundException(`Sticker with ID ${id} not found`);
    }

    await this.stickersRepository.update(id, updateStickerDto);

    return this.findOne(id);
  }

  async remove(id: number) {
    // user가 작성자인지 검증
    await this.stickersRepository.delete(id);
  }
}
