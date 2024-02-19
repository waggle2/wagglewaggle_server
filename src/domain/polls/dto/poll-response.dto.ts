import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PollItem } from '@/domain/pollItems/entities/pollItem.entity';
import { Poll } from '@/domain/polls/entities/poll.entity';

export class PollResponseDto {
  @ApiProperty({ description: '투표 ID', type: Number })
  @Expose()
  readonly id: number;

  @ApiProperty({ description: '투표 제목', type: String })
  @Expose()
  readonly title: string;

  @ApiProperty({ description: '게시글 아이디', type: Number })
  @Expose()
  readonly postId: number;

  @ApiProperty({ description: '투표 마감일자', type: Date })
  @Expose()
  readonly endedAt: Date;

  @ApiProperty({ description: '투표 항목', type: PollItem, isArray: true })
  @Expose()
  readonly pollItems: PollItem[];

  @ApiProperty({ description: '투표 생성일자', type: Date })
  @Expose()
  readonly createdAt: Date;

  @ApiProperty({ description: '투표 수정일자', type: Date })
  @Expose()
  readonly updatedAt: Date;

  constructor(poll: Poll) {
    this.id = poll.id;
    this.title = poll.title;
    this.postId = poll.post.id;
    this.endedAt = poll.endedAt;
    this.pollItems = poll.pollItems;
    this.createdAt = poll.createdAt;
    this.updatedAt = poll.updatedAt;
  }
}
