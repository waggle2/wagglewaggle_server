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

  @ApiProperty({ description: '투표 참여 인원 수', type: Number })
  @Expose()
  readonly participantCount: number;

  @ApiProperty({ description: '투표 마감일자', type: Date })
  @Expose()
  readonly endedAt: Date;

  @ApiProperty({ description: '투표 항목', type: PollItem, isArray: true })
  @Expose()
  readonly pollItems: PollItem[];

  @ApiProperty({ description: '투표 생성일자', type: Date })
  @Expose()
  readonly createdAt: Date;

  constructor(poll: Poll, postId: number) {
    this.id = poll.id;
    this.title = poll.title;
    this.postId = postId;
    this.endedAt = poll.endedAt;
    this.pollItems = poll.pollItems;
    this.createdAt = poll.createdAt;
    this.participantCount = poll.pollItems.reduce(
      (acc, cur) => acc + cur.userIds.length,
      0,
    );
  }
}
