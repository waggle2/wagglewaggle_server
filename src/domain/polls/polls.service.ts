import { Injectable } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Poll } from './entities/poll.entity';
import { Repository } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { PostsService } from '../posts/posts.service';
import { PollItemsService } from '../pollItems/pollItems.service';
import {
  PollConflictException,
  PollNotFoundException,
} from '@/exceptions/domain/polls.exception';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollsRepository: Repository<Poll>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly postsService: PostsService,
    private readonly pollItemsService: PollItemsService,
  ) {}

  async create(postId: number, createPollDto: CreatePollDto) {
    const post =
      await this.postsService.findOneWithoutIncrementingViews(postId);
    if (post.poll)
      throw new PollConflictException('이미 투표 항목이 존재하는 게시글입니다');
    const { title, pollItemDtos, isAnonymous, allowMultipleChoices, endedAt } =
      createPollDto;

    const pollItems = await Promise.all(
      pollItemDtos.map((pollItemDto) =>
        this.pollItemsService.create(pollItemDto),
      ),
    );
    const poll = this.pollsRepository.create({
      title,
      pollItems,
      isAnonymous,
      allowMultipleChoices,
      endedAt,
    });

    post!.poll = poll;
    await this.postsRepository.save(post!);

    return await this.pollsRepository.save(poll);
  }

  async findAll() {
    return await this.pollsRepository.find();
  }

  async findOne(id: number) {
    const poll = await this.pollsRepository.findOneBy({ id });
    if (!poll) {
      throw new PollNotFoundException('해당 투표가 존재하지 않습니다');
    }
    return poll;
  }

  async update(id: number, updatePollDto: UpdatePollDto) {
    const existingPoll = await this.findOne(id);
    const { title, pollItemDtos, isAnonymous, allowMultipleChoices, endedAt } =
      updatePollDto;

    const pollItems = await Promise.all(
      pollItemDtos.map(({ id: pollItemId, content }) =>
        this.pollItemsService.update(pollItemId, { content }),
      ),
    );

    existingPoll.title = title;
    existingPoll.pollItems = pollItems;
    existingPoll.isAnonymous = isAnonymous;
    existingPoll.allowMultipleChoices = allowMultipleChoices;
    existingPoll.endedAt = endedAt;

    return await this.pollsRepository.save(existingPoll);
  }

  async remove(id: number) {
    const poll = await this.findOne(id);
    await Promise.all(
      poll.pollItems.map((pollItem) =>
        this.pollItemsService.remove(pollItem.id),
      ),
    );
    await this.pollsRepository.remove([poll]);
  }
}
