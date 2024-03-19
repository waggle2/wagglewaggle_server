import { Injectable } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Poll } from './entities/poll.entity';
import { EntityManager, Repository } from 'typeorm';
import { PostsService } from '../posts/posts.service';
import {
  AlreadyVoteException,
  DuplicateVoteForbiddenException,
  NotPolledException,
  PollAlreadyExistsException,
  PollAuthorDifferentException,
  PollEndedException,
  PollItemNotFoundException,
  PollNotFoundException,
} from '@/domain/polls/exceptions/polls.exception';
import { User } from '@/domain/users/entities/user.entity';
import { CreatePollItemDto } from '@/domain/polls/dto/create-pollItem.dto';
import { PollItem } from '@/domain/polls/entities/pollItem.entity';
import { Post } from '@/domain/posts/entities/post.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectRepository(Poll)
    private readonly pollsRepository: Repository<Poll>,
    @InjectRepository(PollItem)
    private readonly pollItemsRepository: Repository<PollItem>,
    private readonly postsService: PostsService,
  ) {}

  async create(user: User, postId: number, createPollDto: CreatePollDto) {
    const post =
      await this.postsService.findOneWithoutIncrementingViews(postId);
    this.validatePollCreation(post, user);

    const { title, pollItemDtos, endedAt } = createPollDto;

    // 마감 기한 이틀 뒤를 디폴트로
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);

    const poll = this.pollsRepository.create({
      title,
      post: { id: postId },
      endedAt: endedAt || twoDaysLater,
      pollItems: await Promise.all(
        pollItemDtos.map((item) => this.createPollItem(item)),
      ),
    });

    return await this.pollsRepository.save(poll);
  }

  async findOne(id: number) {
    const poll = await this.pollsRepository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.post', 'post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('poll.pollItems', 'pollItems')
      .where('poll.id = :id', { id })
      .getOne();

    if (!poll) {
      throw new PollNotFoundException('해당 투표가 존재하지 않습니다');
    }

    return poll;
  }

  async remove(user: User, id: number) {
    const poll = await this.findOne(id);
    this.validatePollOwner(poll, user);
    await this.pollsRepository.remove([poll]);
  }

  async createPollItem(createPollItemDto: CreatePollItemDto) {
    return this.pollItemsRepository.create(createPollItemDto);
  }

  async vote(user: User, id: number) {
    const pollItem = await this.validatePollItem(id);
    this.validateUserVote(pollItem, user);

    pollItem.userIds.push(user.id);
    await this.pollItemsRepository.save(pollItem);

    return await this.findOne(pollItem.poll.id);
  }

  async updateVote(user: User, id: number): Promise<Poll> {
    let updatedPollId: number;

    await this.entityManager.transaction(async (transactionEntityManager) => {
      const pollItem = await this.validatePollItem(
        id,
        transactionEntityManager,
      );
      const poll = pollItem.poll;

      const originalPollItem = poll.pollItems.find((item) =>
        item.userIds.includes(user.id),
      );
      this.validateRevote(originalPollItem, pollItem);

      if (originalPollItem) {
        originalPollItem.userIds = originalPollItem.userIds.filter(
          (uid: string) => uid !== user.id,
        );
        await transactionEntityManager.save(originalPollItem);
      }

      pollItem.userIds.push(user.id);
      await transactionEntityManager.save(pollItem);

      updatedPollId = poll.id;
    });

    return await this.findOne(updatedPollId);
  }

  private async validatePollItem(
    id: number,
    entityManager: EntityManager = this.entityManager,
  ) {
    const pollItem = await entityManager.findOne(PollItem, {
      where: { id },
      relations: ['poll', 'poll.pollItems'],
    });
    if (!pollItem) {
      throw new PollItemNotFoundException('해당 투표 항목이 존재하지 않습니다');
    }
    return pollItem;
  }

  private validatePollCreation(post: Post, user: User) {
    if (post.author.id !== user.id)
      throw new PollAuthorDifferentException(
        '게시글의 작성자와 다른 사용자입니다',
      );
    if (post.poll)
      throw new PollAlreadyExistsException(
        '이미 투표 항목이 존재하는 게시글입니다',
      );
  }

  private validatePollOwner(poll: Poll, user: User): void {
    if (poll.post.author.id !== user.id)
      throw new PollAuthorDifferentException(
        '게시글의 작성자와 다른 사용자입니다',
      );
  }

  private validateUserVote(pollItem: PollItem, user: User) {
    if (pollItem.userIds.includes(user.id))
      throw new AlreadyVoteException('이미 투표한 항목입니다');
    pollItem.poll.pollItems.forEach((item) => {
      if (item.userIds.includes(user.id))
        throw new DuplicateVoteForbiddenException(
          '한 항목에만 투표할 수 있습니다',
        );
    });
    if (pollItem.poll.endedAt < new Date())
      throw new PollEndedException('투표가 마감되었습니다');
  }

  private validateRevote(originalPollItem: PollItem, newPollItem: PollItem) {
    if (!originalPollItem)
      throw new NotPolledException(
        '투표하지 않은 투표입니다. 재투표 대상이 아닙니다.',
      );
    if (originalPollItem && originalPollItem.id == newPollItem.id)
      throw new AlreadyVoteException('이미 투표한 항목입니다');
    if (newPollItem.poll.endedAt < new Date()) {
      throw new PollEndedException('투표가 마감되었습니다');
    }
  }
}
