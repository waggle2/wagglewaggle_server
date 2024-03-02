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
import { Animal } from '@/@types/enum/animal.enum';

@Injectable()
export class StickersService {
  constructor(
    @InjectRepository(Sticker)
    private readonly stickersRepository: Repository<Sticker>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async findStickerById(id: number): Promise<Sticker> {
    const sticker = await this.stickersRepository.findOne({
      where: { id },
      relations: ['comment'],
    });
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

  private async increaseSticker(
    comment: Comment,
    animal: Animal,
  ): Promise<void> {
    const receiverStickers = comment.author.userStickers;
    switch (animal) {
      case Animal.BEAR:
        receiverStickers.bearStickers++;
        receiverStickers.bearStickerCount++;
        if (receiverStickers.bearStickerCount >= 5) {
          receiverStickers.bearStickerCount = 0;
          comment.author.bearCoins++;
        }
        break;
      case Animal.CAT:
        receiverStickers.catStickers++;
        receiverStickers.catStickerCount++;
        if (receiverStickers.catStickerCount >= 5) {
          receiverStickers.catStickerCount = 0;
          comment.author.catCoins++;
        }
        break;
      case Animal.DOG:
        receiverStickers.dogStickers++;
        receiverStickers.dogStickerCount++;
        if (receiverStickers.dogStickerCount >= 5) {
          receiverStickers.dogStickerCount = 0;
          comment.author.dogCoins++;
        }
        break;
      case Animal.FOX:
        receiverStickers.foxStickers++;
        receiverStickers.foxStickerCount++;
        if (receiverStickers.foxStickerCount >= 5) {
          receiverStickers.foxStickerCount = 0;
          comment.author.foxCoins++;
        }
        break;
      default:
        break;
    }
  }

  private async decreaseSticker(
    comment: Comment,
    animal: Animal,
  ): Promise<void> {
    const receiverStickers = comment.author.userStickers;
    switch (animal) {
      case Animal.BEAR:
        receiverStickers.bearStickers--;
        receiverStickers.bearStickerCount--;
        if (receiverStickers.bearStickerCount < 0) {
          receiverStickers.bearStickerCount = 4;
          comment.author.bearCoins--;
        }
        break;
      case Animal.CAT:
        receiverStickers.catStickers--;
        receiverStickers.catStickerCount--;
        if (receiverStickers.catStickerCount < 0) {
          receiverStickers.catStickerCount = 4;
          comment.author.catCoins--;
        }
        break;
      case Animal.DOG:
        receiverStickers.dogStickers--;
        receiverStickers.dogStickerCount--;
        if (receiverStickers.dogStickerCount < 0) {
          receiverStickers.dogStickerCount = 4;
          comment.author.dogCoins--;
        }
        break;
      case Animal.FOX:
        receiverStickers.foxStickers--;
        receiverStickers.foxStickerCount--;
        if (receiverStickers.foxStickerCount < 0) {
          receiverStickers.foxStickerCount = 4;
          comment.author.foxCoins--;
        }
        break;
      default:
        break;
    }
  }

  private async updateSecondAnimal(comment: Comment): Promise<void> {
    const receiverStickers = comment.author.userStickers;

    const animalStickerStats = [
      { animal: Animal.BEAR, stickerAmount: receiverStickers.bearStickers },
      { animal: Animal.CAT, stickerAmount: receiverStickers.catStickers },
      { animal: Animal.DOG, stickerAmount: receiverStickers.dogStickers },
      { animal: Animal.FOX, stickerAmount: receiverStickers.foxStickers },
    ];

    const areAllStickerAmountsZero = animalStickerStats.every(
      (stats) => stats.stickerAmount === 0,
    );
    const allSameStickerAmount = animalStickerStats.every(
      (stats) => stats.stickerAmount === animalStickerStats[0].stickerAmount,
    );

    if (areAllStickerAmountsZero) {
      comment.author.secondAnimal = null;
    } else if (allSameStickerAmount) {
      comment.author.secondAnimal = comment.author.secondAnimal;
    } else {
      const mostStickerAnimal = animalStickerStats.reduce((prev, current) =>
        prev.stickerAmount > current.stickerAmount ? prev : current,
      );

      if (mostStickerAnimal.stickerAmount > 0) {
        comment.author.secondAnimal = mostStickerAnimal.animal;
      } else {
        comment.author.secondAnimal = null;
      }
    }
  }

  private async findComment(commentId: number): Promise<Comment> {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.stickers', 'stickers')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('author.userStickers', 'userStickers')
      .where('comment.id = :id', { id: commentId })
      .getOne();
    if (!comment) {
      throw new StickerNotFoundException('댓글이 존재하지 않습니다');
    }
    return comment;
  }

  async create(
    user: User,
    commentId: number,
    createStickerDto: CreateStickerDto,
  ) {
    const comment = await this.findComment(commentId);

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

    await this.increaseSticker(comment, createStickerDto.animal);
    await this.updateSecondAnimal(comment);
    await this.userRepository.save(comment.author);
    return await this.stickersRepository.save(sticker);
  }

  async update(user: User, id: number, updateStickerDto: UpdateStickerDto) {
    const sticker = await this.findStickerById(id);
    await this.handleStickerUserPermission(user, sticker);

    const comment = await this.findComment(sticker.comment.id);

    await this.decreaseSticker(comment, sticker.animal);
    await this.increaseSticker(comment, updateStickerDto.animal);
    await this.updateSecondAnimal(comment);
    await this.userRepository.save(comment.author);
    await this.stickersRepository.update(id, updateStickerDto);
    return await this.findStickerById(id);
  }

  async remove(user: User, id: number) {
    const sticker = await this.findStickerById(id);
    await this.handleStickerUserPermission(user, sticker);

    const comment = await this.findComment(sticker.comment.id);

    await this.decreaseSticker(comment, sticker.animal);
    await this.updateSecondAnimal(comment);
    await this.userRepository.save(comment.author);
    await this.stickersRepository.delete(id);
  }
}
