import { Expose } from 'class-transformer';
import { Post } from '../entities/post.entity';
import { Tag } from '@/domain/types/enum/tags.enum';
import { CommentResponseDto } from '@/domain/comments/dto/response.comments.dto';

export class PostResponseDto {
  id: number;
  title: string;
  content: string;
  tags: Tag[];
  comments: CommentResponseDto[];
  // poll?: PollResponseDto | null;

  @Expose({ name: 'is_anonymous' })
  isAnonymous: boolean;

  @Expose({ name: 'created_at' })
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  @Expose({ name: 'deleted_at' })
  deletedAt?: Date;

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.content = post.content;
    this.tags = post.tags;
    this.isAnonymous = post.isAnonymous;
    this.createdAt = post.createdAt;
    this.updatedAt = post.updatedAt;
    this.deletedAt = post.deletedAt;
    this.comments = post.comments.map(
      (comment) => new CommentResponseDto(comment),
    );
    // this.poll = post?.poll === null ? null : new PollResponseDto(post?.poll);
  }
}
