import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from '../posts/posts.service';
import { Post } from '@/domain/posts/entities/post.entity';
import {
  CommentAlreadyDeletedException,
  CommentAuthorDifferentException,
  CommentBadRequestException,
  CommentNotFoundException,
} from '@/domain/comments/exceptions/comments.exception';
import { User } from '@/domain/users/entities/user.entity';
import { AuthorityName } from '@/@types/enum/user.enum';

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
      .leftJoinAndSelect('comment.author', 'author')
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
      .leftJoinAndSelect('comment.author', 'author')
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
    user: User,
    postId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postService.findOneWithoutIncrementingViews(postId);
    const newComment = this.commentRepository.create({
      ...createCommentDto,
      author: { id: user.id },
      post: { id: post.id },
    });

    await this.updatePostCommentNum(post, 1);

    return await this.commentRepository.save(newComment);
  }

  async addReply(
    user: User,
    parentId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const parent = await this.findOne(parentId);

    const newComment = this.commentRepository.create({
      ...createCommentDto,
      author: { id: user.id },
      parent: { id: parent.id },
    });

    await this.updatePostCommentNum(parent.post, 1);

    return await this.commentRepository.save(newComment);
  }

  async remove(user: User, id: number) {
    const existingComment = await this.findOne(id);

    const userAuthorities = user.authorities.map(
      (authority) => authority.authorityName,
    );

    const isAuthorOrAdmin =
      user.id === existingComment.author.id ||
      userAuthorities.includes(AuthorityName.ADMIN);

    if (!isAuthorOrAdmin)
      throw new CommentAuthorDifferentException(
        '댓글을 삭제할 권한이 없습니다',
      );

    await this.commentRepository.softDelete(id);

    const post = existingComment.parent
      ? existingComment.parent.post
      : existingComment.post;
    await this.updatePostCommentNum(post, -1);
  }

  async removeMany(user: User, ids: number[]) {
    if (!ids || ids.length === 0)
      throw new CommentBadRequestException('삭제할 댓글이 없습니다');

    const deletedComments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .withDeleted()
      .where('comment.deleted_at IS NOT NULL')
      .getMany();

    const deletedCommentsIds = deletedComments.map((post) => post.id);

    for (const id of ids) {
      if (deletedCommentsIds.includes(id)) {
        throw new CommentAlreadyDeletedException('잘못된 접근입니다');
      }
    }

    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoinAndSelect('comment.post', 'post')
      .whereInIds(ids)
      .getMany();

    // 게시글 ID 추출
    const postIds = comments
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

  async update(user: User, id: number, updateData: UpdateCommentDto) {
    const comment = await this.findOne(id);

    if (user.id !== comment.author.id)
      throw new CommentAuthorDifferentException(
        '댓글을 수정할 권한이 없습니다',
      );

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
