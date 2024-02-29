import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockUser } from './entities/block.entity';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { User } from '../users/entities/user.entity';
import { AuthorityName } from '@/@types/enum/user.enum';
import { UserBlockForbiddenException } from '../authentication/exceptions/authentication.exception';
import {
  BlockBadRequestException,
  BlockNotFoundException,
} from './exceptions/block.exception';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(BlockUser)
    private readonly blockUserRepository: Repository<BlockUser>,
    private readonly usersService: UsersService,
  ) {}

  async createBlock(user: User, blockedUserId: string): Promise<BlockUser> {
    await this.usersService.findById(blockedUserId);

    if (user.id === blockedUserId) {
      throw new BlockBadRequestException('자기 자신을 차단할 수 없습니다.');
    }
    const blockedUsers = user.blockedUsers.map((block) => block.blockedUser.id);
    if (blockedUsers.includes(blockedUserId)) {
      throw new BlockBadRequestException('이미 차단된 사용자입니다.');
    }

    const block = this.blockUserRepository.create({
      blockedBy: { id: user.id },
      blockedUser: { id: blockedUserId },
    });
    const blocked = await this.blockUserRepository.save(block);

    return blocked;
  }

  async getBlockedUsers(
    user: User,
    blockedBy: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<{ blocks: BlockUser[]; total: number }> {
    const { page, pageSize } = pageOptionsDto;
    if (!this.isAdmin(user))
      throw new UserBlockForbiddenException('접근 권한이 없습니다');

    const queryBuilder = await this.findBlocks();
    let blocks: BlockUser[], total: number;

    if (page && pageSize) {
      [blocks, total] = await queryBuilder
        .andWhere('blockedBy.id = :blockedBy', { blockedBy })
        .skip(pageSize * (page - 1))
        .take(pageSize)
        .getManyAndCount();
    } else {
      blocks = await queryBuilder
        .andWhere('blockedBy.id = :blockedBy', { blockedBy })
        .getMany();
      total = blocks.length;
    }

    return { blocks, total };
  }

  async findAll(
    user: User,
    pageOptionsDto: PageOptionsDto,
  ): Promise<{ blocks: BlockUser[]; total: number }> {
    const { page, pageSize } = pageOptionsDto;
    if (!this.isAdmin(user))
      throw new UserBlockForbiddenException('접근 권한이 없습니다');

    const queryBuilder = await this.findBlocks();
    let blocks: BlockUser[], total: number;

    if (page && pageSize) {
      [blocks, total] = await queryBuilder
        .skip(pageSize * (page - 1))
        .take(pageSize)
        .getManyAndCount();
    } else {
      blocks = await queryBuilder.getMany();
      total = blocks.length;
    }

    return { blocks, total };
  }

  async findOne(user: User, id: number): Promise<BlockUser> {
    if (!this.isAdmin(user))
      throw new UserBlockForbiddenException('접근 권한이 없습니다');

    const queryBuilder = await this.findBlocks();
    const block = await queryBuilder
      .andWhere('block.id = :id', { id })
      .getOne();
    if (!block) {
      throw new BlockNotFoundException('해당 차단을 찾을 수 없습니다.');
    }

    return block;
  }

  async remove(user: User, id: number): Promise<void> {
    const block = await this.findOne(user, id);
    await this.blockUserRepository.delete(block.id);
  }

  private async findBlocks() {
    return this.blockUserRepository
      .createQueryBuilder('block')
      .leftJoinAndSelect('block.blockedBy', 'blockedBy')
      .leftJoinAndSelect('blockedBy.credential', 'blockedBy_credential')
      .leftJoinAndSelect('block.blockedUser', 'blockedUser')
      .leftJoinAndSelect('blockedUser.credential', 'blockedUser_credential');
  }

  private isAdmin(user: User): boolean {
    return user.authorities.some(
      (authority) => authority.authorityName === AuthorityName.ADMIN,
    );
  }
}
