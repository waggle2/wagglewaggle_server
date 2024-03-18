import { Injectable } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Poll } from './entities/poll.entity';
import { Repository } from 'typeorm';
import { PostsService } from '../posts/posts.service';
import { PollItemsService } from '../pollItems/pollItems.service';
import {
  PollAuthorDifferentException,
  PollConflictException,
  PollNotFoundException,
} from '@/domain/polls/exceptions/polls.exception';
import { User } from '@/domain/users/entities/user.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollsRepository: Repository<Poll>,
    private readonly postsService: PostsService,
    private readonly pollItemsService: PollItemsService,
  ) {}

  async create(user: User, postId: number, createPollDto: CreatePollDto) {
    const post =
      await this.postsService.findOneWithoutIncrementingViews(postId);

    if (post.author.id !== user.id)
      throw new PollAuthorDifferentException('잘못된 접근입니다');

    if (post.poll)
      throw new PollConflictException('이미 투표 항목이 존재하는 게시글입니다');

    const { title, pollItemDtos, endedAt } = createPollDto;

    // 마감 기한 이틀 뒤를 디폴트로
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);

    const poll = this.pollsRepository.create({
      title,
      post: { id: postId },
      endedAt: endedAt ? endedAt : twoDaysLater,
    });

    poll.pollItems = await Promise.all(
      pollItemDtos.map((pollItemDto) =>
        this.pollItemsService.create(pollItemDto),
      ),
    );

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

    if (poll.post.author.id !== user.id)
      throw new PollAuthorDifferentException('잘못된 접근입니다');

    await this.pollsRepository.remove([poll]);
  }
}
