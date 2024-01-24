import { Expose } from 'class-transformer';
import { Poll } from '../entities/poll.entity';
import { PollItemResponseDto } from '@/domain/pollItems/dto/response.pollItem.dto';

export class PollResponseDto {
  id: number;
  title: string;

  @Expose()
  isEnd: boolean;

  @Expose()
  isAnonymous: boolean;

  @Expose()
  allowMultipleChoices: boolean;

  @Expose()
  endedAt: Date;

  @Expose()
  pollItems: PollItemResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(poll: Poll) {
    this.id = poll.id;
    this.title = poll.title;
    this.isEnd = poll.isEnd;
    this.isAnonymous = poll.isAnonymous;
    this.allowMultipleChoices = poll.allowMultipleChoices;
    this.endedAt = poll.endedAt;
    this.createdAt = poll.createdAt;
    this.updatedAt = poll.updatedAt;
    this.pollItems = poll.pollItems.map(
      (pollItem) => new PollItemResponseDto(pollItem),
    );
  }
}
