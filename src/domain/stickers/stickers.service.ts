import { Injectable } from '@nestjs/common';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sticker } from '@/domain/stickers/entities/sticker.entity';
import { Repository } from 'typeorm';
import { User } from '@/domain/users/entities/user.entity';
import { Comment } from '@/domain/comments/entities/comment.entity';
import {
  StickerAlreadyExistsException,
  StickerDifferentUserException,
  StickerNotFoundException,
} from '@/domain/stickers/exceptions/stickers.exception';

@Injectable()
export class StickersService {
  constructor(
    @InjectRepository(Sticker)
    private readonly stickersRepository: Repository<Sticker>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  private async findStickerById(id: number): Promise<Sticker> {
    const sticker = await this.stickersRepository.findOneBy({ id });
    if (!sticker) {
      throw new StickerNotFoundException(`해당 스티커가 존재하지 않습니다`);
    }
    return sticker;
  }

  private async handleStickerUserPermission(
    user: User,
    sticker: Sticker,
  ): Promise<void> {
    if (sticker.userId !== user.id) {
      throw new StickerDifferentUserException('해당 권한이 없습니다');
    }
  }

  async create(
    user: User,
    commentId: number,
    createStickerDto: CreateStickerDto,
  ) {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.stickers', 'stickers')
      .where('comment.id = :id', { id: commentId })
      .getOne();

    if (!comment) {
      throw new StickerNotFoundException('댓글이 존재하지 않습니다');
    }

    const existingSticker = comment.stickers.find(
      (sticker) => sticker.userId === user.id,
    );

    if (existingSticker) {
      throw new StickerAlreadyExistsException('이미 스티커를 남긴 댓글입니다');
    }

    const sticker = this.stickersRepository.create({
      ...createStickerDto,
      userId: user.id,
      comment,
    });

    return await this.stickersRepository.save(sticker);
  }

  async findOne(id: number) {
    return await this.findStickerById(id);
  }

  async update(user: User, id: number, updateStickerDto: UpdateStickerDto) {
    const sticker = await this.findStickerById(id);
    await this.handleStickerUserPermission(user, sticker);
    await this.stickersRepository.update(id, updateStickerDto);
    return this.findOne(id);
  }

  async remove(user: User, id: number) {
    const sticker = await this.findStickerById(id);
    await this.handleStickerUserPermission(user, sticker);
    await this.stickersRepository.delete(id);
  }
}
