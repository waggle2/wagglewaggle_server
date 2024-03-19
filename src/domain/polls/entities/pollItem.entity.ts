import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Poll } from '@/domain/polls/entities/poll.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Entity('poll_items')
export class PollItem {
  @ApiProperty({ description: '투표 항목 ID', type: Number })
  @Expose()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '투표 항목 내용', type: String })
  @Expose()
  @Column({ type: 'varchar', length: 50, nullable: false })
  content: string;

  @ManyToOne('Poll', 'pollItems', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id', referencedColumnName: 'id' })
  poll: Poll;

  @ApiProperty({
    description: '이 항목에 투표한 유저 아이디 목록',
    type: String,
    isArray: true,
  })
  @Expose()
  @Column({ name: 'user_ids', type: 'json' })
  userIds: string[] = [];
}
