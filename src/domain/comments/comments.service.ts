import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from '../posts/posts.service';
import { Post } from '@/domain/posts/entities/post.entity';
import {
  CommentBadRequestException,
  CommentNotFoundException,
} from '@/lib/exceptions/domain/comments.exception';

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
      .leftJoin('comment.post', 'post')
      .addSelect('post.id', 'postId')
      .where('comment.deleted_at IS NULL')
      .orderBy('comment.created_at', 'ASC')
      .getRawMany();
  }

  async findCommentsByPostId(postId: number): Promise<Comment[]> {
    await this.postService.findOneWithoutIncrementingViews(postId);
    return this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('comment.stickers', 'stickers')
      .where('comment.deleted_at IS NULL')
      .andWhere('post.id = :postId', { postId })
      .orderBy('comment.created_at', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('comment.stickers', 'stickers')
      .where('comment.deleted_at IS NULL')
      .andWhere('comment.id = :id', { id })
      .getOne();

    if (!comment)
      throw new CommentNotFoundException('존재하지 않는 댓글입니다');

    return comment;
  }

  async create(
    postId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postService.findOneWithoutIncrementingViews(postId);
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

  async removeMany(ids: number[]) {
    if (!ids || ids.length === 0)
      throw new CommentBadRequestException('삭제할 댓글이 없습니다');

    // 댓글들 찾기
    const deletedComments = await this.commentRepository
      .createQueryBuilder('comment')
      .whereInIds(ids)
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoinAndSelect('comment.post', 'post')
      .getMany();

    // 게시글 ID 추출
    const postIds = deletedComments
      .map((comment) =>
        comment.parent ? comment.parent.post.id : comment.post.id,
      )
      .filter((postId, index, self) => self.indexOf(postId) === index);

    const result = await this.commentRepository.softDelete(ids);

    if (result.affected === 0)
      throw new CommentNotFoundException('삭제할 댓글이 없습니다');

    // 게시글들의 댓글 개수 갱신
    for (const postId of postIds) {
      const post =
        await this.postService.findOneWithoutIncrementingViews(postId);
      if (post) {
        await this.updatePostCommentNum(post, -1);
      }
    }
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
