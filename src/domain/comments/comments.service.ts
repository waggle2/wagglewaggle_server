import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from '../posts/posts.service';
import { Post } from '@/domain/posts/entities/post.entity';
import { CommentNotFoundException } from '@/exceptions/domain/comments.exception';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly postService: PostsService,
  ) {}

  async findAll(): Promise<Comment[]> {
    return this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.deleted_at IS NULL')
      .orderBy('comment.created_at', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Comment> {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('comment.stickers', 'stickers')
      .where('comment.deleted_at IS NULL')
      .andWhere('comment.id = :id', { id });

    const comment = await queryBuilder.getOne();

    if (!comment)
      throw new CommentNotFoundException('존재하지 않는 댓글입니다');

    return comment;
  }

  async create(
    postId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postService.findOne(postId);
    const newComment = this.commentRepository.create({
      ...createCommentDto,
      // user
      post: { id: post?.id },
    });

    await this.updatePostCommentNum(post, 1);

    return await this.commentRepository.save(newComment);
  }

  async addReply(parentId: number, createCommentDto: CreateCommentDto) {
    const parent = await this.findOne(parentId);

    const newComment = this.commentRepository.create({
      ...createCommentDto,
      // user
      parent: { id: parent.id },
    });

    await this.updatePostCommentNum(parent.post, 1);

    return await this.commentRepository.save(newComment);
  }

  async remove(id: number) {
    const existingComment = await this.findOne(id);

    await this.commentRepository.softDelete(id);

    const post = existingComment.parent
      ? existingComment.parent.post
      : existingComment.post;
    await this.updatePostCommentNum(post, -1);
  }

  async update(id: number, updateData: UpdateCommentDto) {
    await this.findOne(id);
    await this.commentRepository.update(id, updateData);
    return this.findOne(id);
  }

  private async updatePostCommentNum(
    post: Post,
    increment: number,
  ): Promise<void> {
    post.commentNum += increment;
    await this.postsRepository.save(post);
  }
}
