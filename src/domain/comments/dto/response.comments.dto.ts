import { Comment } from '../entities/comment.entity';

export class CommentResponseDto {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  constructor(comment: Comment) {
    this.id = comment.id;
    this.content = comment.content;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
    this.deletedAt = comment.deletedAt;
  }
}
