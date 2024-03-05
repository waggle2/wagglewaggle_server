import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { User } from '../users/entities/user.entity';
import { BlockBadRequestException } from './exceptions/block.exception';
import { applyPaging } from '@/common/utils/applyPaging';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  async createBlock(user: User, blockedUserId: string) {
    const userToBlockNow = await this.usersService.findById(blockedUserId);

    if (user.id === blockedUserId) {
      throw new BlockBadRequestException('자기 자신을 차단할 수 없습니다.');
    }

    const blockedUsers = user.usersBlockedByThisUser;

    if (blockedUsers.includes(blockedUserId)) {
      throw new BlockBadRequestException('이미 차단된 사용자입니다.');
    }

    user.usersBlockedByThisUser.push(blockedUserId);
    await this.usersRepository.save(user);
    userToBlockNow.usersBlockingThisUser.push(user.id);
    await this.usersRepository.save(userToBlockNow);
  }

  async getBlockedUsersByCurrentUser(
    user: User,
    pageOptionsDto: PageOptionsDto,
  ) {
    const blockedUsers = user.usersBlockedByThisUser;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.credential', 'credential')
      .whereInIds(blockedUsers);

    return await applyPaging(queryBuilder, pageOptionsDto);
  }

  async remove(user: User, id: string) {
    if (user.usersBlockedByThisUser.includes(id)) {
      user.usersBlockedByThisUser = user.usersBlockedByThisUser.filter(
        (userId) => userId !== id,
      );
      await this.usersRepository.save(user);
    }
  }
}
