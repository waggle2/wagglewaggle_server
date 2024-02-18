import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Sticker } from '@/domain/stickers/entities/sticker.entity';
import { UserProfileDto } from '@/domain/users/dto/user-profile.dto';
import { Comment } from '@/domain/comments/entities/comment.entity';

export class CommentResponseDto {
  @ApiProperty({ description: '댓글 ID', type: Number })
  @Expose()
  readonly id: number;

  @ApiProperty({ description: '댓글 내용', type: String })
  @Expose()
  readonly content: string;

  @ApiProperty({ description: '익명 여부', type: Boolean })
  @Expose()
  readonly isAnonymous: boolean;

  @ApiProperty({ description: '게시글 아이디', type: Number })
  @Expose()
  readonly postId?: number | null;

  @ApiProperty({ description: '부모 댓글 아이디', type: Number })
  @Expose()
  readonly parentId?: number | null;

  @ApiProperty({
    type: () => CommentResponseDto,
    isArray: true,
    description: '대댓글',
  })
  @Type(() => CommentResponseDto)
  @Expose()
  readonly replies: CommentResponseDto[];

  @ApiProperty({
    type: () => Sticker,
    isArray: true,
    description: '댓글 스티커 배열',
  })
  @Type(() => Sticker)
  @Expose()
  stickers: Sticker[];

  @ApiProperty({
    type: () => UserProfileDto,
    description: '댓글 작성자 프로필',
  })
  @Type(() => UserProfileDto)
  @Expose()
  readonly author: UserProfileDto;

  @ApiProperty({ type: Date, description: '댓글 작성일자' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: Date, description: '댓글 수정일자' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: Date, description: '댓글 삭제일자' })
  @Expose()
  deletedAt: Date | null;

  constructor(comment: Comment) {
    this.id = comment.id;
    this.content = comment.content;
    this.isAnonymous = comment.isAnonymous;
    this.postId = comment.post ? comment.post.id : null;
    this.parentId = comment.parent ? comment.parent.id : null;
    this.replies = comment.replies
      ? comment.replies.map((reply) => new CommentResponseDto(reply))
      : [];
    this.stickers = comment.stickers;
    this.author = new UserProfileDto(comment.author);
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
    this.deletedAt = comment.deletedAt;
  }
}
