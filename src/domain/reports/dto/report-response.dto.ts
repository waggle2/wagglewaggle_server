import { ReportReason } from '@/@types/enum/report-reason.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Report } from '@/domain/reports/entities/report.entity';

export class ReportResponseDto {
  @ApiProperty({
    description: '신고 ID',
    type: Number,
  })
  @Expose()
  readonly id: number;

  @ApiProperty({
    description: '신고자 ID',
    type: String,
  })
  @Expose()
  readonly reporterId: string;

  @ApiProperty({
    description: '신고 게시물 ID',
    type: Number,
    required: false,
  })
  @Expose()
  readonly postId?: number;

  @ApiProperty({
    description: '신고 댓글 ID',
    type: Number,
    required: false,
  })
  @Expose()
  readonly commentId?: number;

  @ApiProperty({
    description: '신고 채팅방 ID',
    type: Number,
    required: false,
  })
  @Expose()
  readonly messageRoomId?: number;

  @ApiProperty({
    description: '신고 받은쪽지 ID',
    type: Number,
    required: false,
  })
  @Expose()
  readonly messageId?: number;

  @ApiProperty({
    description: '신고 내용',
    type: String,
  })
  @Expose()
  readonly content: string;

  @ApiProperty({
    description: '신고 사유',
    enum: ReportReason,
  })
  @Expose()
  readonly reason: ReportReason;

  @ApiProperty({
    description: '신고일자',
    type: Date,
  })
  @Expose()
  readonly createdAt: Date;

  @ApiProperty({
    description: '신고 삭제일자',
    type: Date,
  })
  @Expose()
  readonly deletedAt: Date;

  constructor(report: Report) {
    this.id = report.id;
    this.reporterId = report.reporter.id;
    this.postId = report?.postId;
    this.commentId = report?.commentId;
    this.messageRoomId = report?.messageRoomId;
    this.messageId = report?.messageId;
    this.content = report.content;
    this.reason = report.reason;
    this.createdAt = report.createdAt;
    this.deletedAt = report.deletedAt;
  }
}
