import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePollItemDto } from './dto/create-pollItem.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { PollItem } from './entities/pollItem.entity';
import { EntityManager, Repository } from 'typeorm';
import { User } from '@/domain/users/entities/user.entity';
import {
  AlreadyVoteException,
  DuplicateVoteForbiddenException,
  PollNotFoundException,
} from '@/domain/polls/exceptions/polls.exception';
import { Poll } from '@/domain/polls/entities/poll.entity';

@Injectable()
export class PollItemsService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
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

  async updateVote(user: User, id: number) {
    return await this.entityManager.transaction(async () => {
      const newPollItemToVote = await this.pollItemsRepository
        .createQueryBuilder('poll_item')
        .leftJoinAndSelect('poll_item.poll', 'poll')
        .leftJoinAndSelect('poll.pollItems', 'poll_items')
        .where('poll_item.id = :id', { id })
        .getOne();

      if (!newPollItemToVote) {
        throw new NotFoundException('해당 투표 항목이 존재하지 않습니다');
      }

      const poll = newPollItemToVote.poll;

      // 원래 투표에서 투표를 취소
      const originalPollItem = poll.pollItems.find((pi) =>
        pi.userIds.includes(user.id),
      );

      if (originalPollItem.id == newPollItemToVote.id) {
        throw new AlreadyVoteException('이미 투표한 항목입니다');
      }

      if (originalPollItem) {
        originalPollItem.userIds = originalPollItem.userIds.filter(
          (uid) => uid !== user.id,
        );
        await this.pollItemsRepository.save(originalPollItem);
      }

      // 새로운 투표에 투표
      newPollItemToVote.userIds.push(user.id);
      await this.pollItemsRepository.save(newPollItemToVote);

      const votedPoll = await this.pollsRepository.findOneBy({
        id: newPollItemToVote.poll.id,
      });
      if (!votedPoll) throw new PollNotFoundException('잘못된 접근입니다');

      return votedPoll;
    });
  }
}
