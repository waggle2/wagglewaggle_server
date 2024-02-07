import { Injectable, NotFoundException } from '@nestjs/common';
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
} from '@/domain/stickers/exceptions/stickers.exception';

@Injectable()
export class StickersService {
  constructor(
    @InjectRepository(Sticker)
    private readonly stickersRepository: Repository<Sticker>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

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

    comment.stickers.forEach((sticker) => {
      if (sticker.userId === user.id) {
        throw new StickerAlreadyExistsException(
          '이미 스티커를 남긴 댓글입니다다',
        );
      }
    });

    const sticker = this.stickersRepository.create({
      ...createStickerDto,
      userId: user.id,
      comment: { id: comment.id },
    });

    return await this.stickersRepository.save(sticker);
  }

  async findOne(id: number) {
    return await this.stickersRepository.findOneBy({ id });
  }

  async update(user: User, id: number, updateStickerDto: UpdateStickerDto) {
    const existingSticker = await this.findOne(id);

    if (!existingSticker) {
      throw new NotFoundException(`Sticker with ID ${id} not found`);
    }

    if (existingSticker.userId !== user.id) {
      throw new StickerDifferentUserException('해당 권한이 없습니다');
    }

    await this.stickersRepository.update(id, updateStickerDto);

    return this.findOne(id);
  }

  async remove(user: User, id: number) {
    const existingSticker = await this.findOne(id);

    if (!existingSticker) {
      throw new NotFoundException(`Sticker with ID ${id} not found`);
    }

    if (existingSticker.userId !== user.id) {
      throw new StickerDifferentUserException('해당 권한이 없습니다');
    }

    await this.stickersRepository.delete(id);
  }
}
