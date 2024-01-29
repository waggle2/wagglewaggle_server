import { Expose } from 'class-transformer';
import { PollItem } from '../entities/pollItem.entity';

export class PollItemResponseDto {
  id: number;
  content: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(pollItem: PollItem) {
    this.id = pollItem.id;
    this.content = pollItem.content;
    this.createdAt = pollItem.createdAt;
    this.updatedAt = pollItem.updatedAt;
  }
}
