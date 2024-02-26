import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
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
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { CommentFindDto } from '@/domain/comments/dto/comment-find.dto';
import { NotificationService } from '@/notification/notification.service';
import { NotificationType } from '@/@types/enum/notification-type.enum';
import { SearchService } from '@/domain/search/search.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly postService: PostsService,
    private readonly notificationService: NotificationService,
    private readonly searchService: SearchService,
  ) {}

  private createQueryBuilderWithJoins(): SelectQueryBuilder<Comment> {
    return this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('author.credential', 'credential')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.author', 'reply_author')
      .leftJoinAndSelect('reply_author.credential', 'reply_credential')
      .leftJoinAndSelect('comment.stickers', 'stickers')
      .where('comment.deletedAt IS NULL');
  }

  async findAll(
    commentFindDto: CommentFindDto,
    pageOptionsDto: PageOptionsDto,
  ) {
    const { postId } = commentFindDto;
    const { page, pageSize } = pageOptionsDto;
    const queryBuilder = this.createQueryBuilderWithJoins();

    queryBuilder.orderBy('comment.createdAt', 'ASC');

    if (postId) {
      queryBuilder.andWhere('post.id = :postId', { postId });
    }

    let comments: Comment[], total: number;

    if (page && pageSize) {
      [comments, total] = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();
    } else {
      [comments, total] = await queryBuilder.getManyAndCount();
    }

    return {
      comments,
      total,
    };
  }

  async findOne(id: number): Promise<Comment> {
    const queryBuilder = this.createQueryBuilderWithJoins();
    const comment = await queryBuilder
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
      author: user,
      post: { id: post.id },
    });

    const updatedPost = await this.updatePostCommentNum(post, 1);
    const savedComment = await this.commentRepository.save(newComment);
    await this.searchService.update(postId, updatedPost);

    // 게시글 작성자에게 알림 전송
    const postAuthor = post.author;
    const notification = await this.notificationService.createNotification(
      postAuthor.id,
      {
        type: NotificationType.COMMENT,
        message: `${user.credential.nickname}님이 게시글에 댓글을 남겼습니다`,
      },
    );

    if (postAuthor.isSubscribed) {
      await this.notificationService.sendNotificationToUser(postAuthor.id, {
        type: notification.type,
        message: notification.message,
        subscriberNickname: postAuthor.credential.nickname,
      });
    }

    return savedComment;
  }

  async addReply(
    user: User,
    parentId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const parent = await this.findOne(parentId);

    const newComment = this.commentRepository.create({
      ...createCommentDto,
      author: user,
      parent: { id: parent.id },
    });

    const updatedPost = await this.updatePostCommentNum(parent.post, 1);
    await this.searchService.update(parent.post.id, updatedPost);

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
    const updatedPost = await this.updatePostCommentNum(post, -1);
    await this.searchService.update(post.id, updatedPost);
  }

  async removeMany(ids: number[]) {
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
        const updatedPost = await this.updatePostCommentNum(post, -1);
        await this.searchService.update(postId, updatedPost);
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

  private async updatePostCommentNum(post: Post, increment: number) {
    post.commentNum += increment;
    return await this.postsRepository.save(post);
  }
}
