import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePollItemDto } from './dto/create-pollItem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PollItem } from './entities/pollItem.entity';
import { Repository } from 'typeorm';
import { User } from '@/domain/users/entities/user.entity';
import {
  AlreadyVoteException,
  DuplicateVoteForbiddenException,
  PollAuthorDifferentException,
  PollNotFoundException,
} from '@/domain/polls/exceptions/polls.exception';
import { Poll } from '@/domain/polls/entities/poll.entity';

@Injectable()
export class PollItemsService {
  constructor(
    @InjectRepository(PollItem)
    private readonly pollItemsRepository: Repository<PollItem>,
    @InjectRepository(Poll)
    private readonly pollsRepository: Repository<Poll>,
  ) {}

  async create(createPollItemDto: CreatePollItemDto) {
    const pollItem = this.pollItemsRepository.create(createPollItemDto);
    return await this.pollItemsRepository.save(pollItem);
  }

  async vote(user: User, id: number) {
    const pollItem = await this.pollItemsRepository
      .createQueryBuilder('poll_item')
      .leftJoinAndSelect('poll_item.poll', 'poll')
      .leftJoinAndSelect('poll.pollItems', 'poll_items')
      .where('poll_item.id = :id', { id })
      .getOne();

    const poll = pollItem.poll;

    // 이 투표 항목에 투표했는지
    if (pollItem.userIds.includes(user.id)) {
      throw new AlreadyVoteException('이미 투표한 항목입니다');
    }

    // 이미 투표한 항목이 있다면 403
    const pollItems = poll.pollItems;
    pollItems.forEach((pi) => {
      if (pi.userIds.includes(user.id))
        throw new DuplicateVoteForbiddenException(
          '한 항목에만 투표할 수 있습니다',
        );
    });

    pollItem.userIds.push(user.id);
    await this.pollItemsRepository.save(pollItem);

    const votedPoll = await this.pollsRepository.findOneBy({
      id: pollItem.poll.id,
    });
    if (!votedPoll) throw new PollNotFoundException('잘못된 접근입니다');

    return votedPoll;
  }

  async findOne(id: number) {
    const pollItem = await this.pollItemsRepository.findOneBy({ id });

    if (!pollItem) {
      throw new NotFoundException('해당 투표 항목이 존재하지 않습니다');
    }

    return pollItem;
  }

  async update(id: number, pollItemDto: CreatePollItemDto) {
    await this.findOne(id);
    await this.pollItemsRepository.update(id, pollItemDto);
    return await this.findOne(id);
  }

  async removeMultiple(user: User, ids: number[]) {
    for (const id of ids) {
      const pollItem = await this.pollItemsRepository
        .createQueryBuilder('poll_item')
        .leftJoinAndSelect('poll_item.poll', 'poll')
        .leftJoinAndSelect('poll.post', 'post')
        .leftJoinAndSelect('post.author', 'author')
        .where('poll_item.id = :id', { id })
        .getOne();

      if (user.id !== pollItem.poll.post.author.id)
        throw new PollAuthorDifferentException('잘못된 접근입니다');
    }

    return await this.pollItemsRepository.delete(ids);
  }
}
