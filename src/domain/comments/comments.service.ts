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
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoinAndSelect('author.credential', 'credential')
      .leftJoinAndSelect('author.profileItems', 'author_profileItems')
      .leftJoinAndSelect('author_profileItems.emoji', 'author_emoji')
      .leftJoinAndSelect('author_profileItems.wallpaper', 'author_wallpaper')
      .leftJoinAndSelect('author_profileItems.background', 'author_background')
      .leftJoinAndSelect('author_profileItems.frame', 'author_frame')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.author', 'reply_author')
      .leftJoinAndSelect(
        'reply_author.profileItems',
        'reply_author_profileItems',
      )
      .leftJoinAndSelect(
        'reply_author_profileItems.emoji',
        'reply_author_emoji',
      )
      .leftJoinAndSelect(
        'reply_author_profileItems.wallpaper',
        'reply_author_wallpaper',
      )
      .leftJoinAndSelect(
        'reply_author_profileItems.background',
        'reply_author_background',
      )
      .leftJoinAndSelect(
        'reply_author_profileItems.frame',
        'reply_author_frame',
      )
      .leftJoinAndSelect('reply_author.credential', 'reply_credential')
      .leftJoinAndSelect('comment.stickers', 'stickers')
      .where('comment.deletedAt IS NULL');
  }

  async paginate(
    queryBuilder: SelectQueryBuilder<Comment>,
    pageOptionsDto: PageOptionsDto,
  ): Promise<[Comment[], number]> {
    const { page, pageSize } = pageOptionsDto;
    if (page && pageSize) {
      return queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();
    } else {
      return queryBuilder.getManyAndCount();
    }
  }

  async findAll(
    commentFindDto: CommentFindDto,
    pageOptionsDto: PageOptionsDto,
  ) {
    const { postId } = commentFindDto;
    const queryBuilder = this.createQueryBuilderWithJoins().orderBy(
      'comment.createdAt',
      'ASC',
    );

    if (postId) {
      queryBuilder.andWhere('post.id = :postId', { postId });
    }

    const [comments, total] = await this.paginate(queryBuilder, pageOptionsDto);

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
    const savedComment = await this.commentRepository.save(newComment);

    await this.updatePostCommentNum(post, 1);
    await this.notifyPostAuthor(post, post.author);

    return savedComment;
  }

  async addReply(
    user: User,
    parentId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const parent = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .where('comment.id = :parentId', { parentId })
      .getOne();

    const newComment = this.commentRepository.create({
      ...createCommentDto,
      author: user,
      parent: { id: parent.id },
    });

    await this.updatePostCommentNum(parent.post, 1);
    return await this.commentRepository.save(newComment);
  }

  async remove(user: User, id: number) {
    const existingComment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.id = :id', { id })
      .getOne();

    if (!existingComment)
      throw new CommentNotFoundException('존재하지 않는 댓글입니다');

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

    let post: Post;
    if (existingComment.parent) {
      const parentComment = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.post', 'post')
        .leftJoinAndSelect('comment.parent', 'parent')
        .leftJoinAndSelect('comment.author', 'author')
        .where('comment.id = :id', { id: existingComment.parent.id })
        .withDeleted()
        .getOne();
      post = parentComment.post;
    } else {
      post = existingComment.post;
    }

    await this.updatePostCommentNum(post, -1);
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

    // 삭제하려는 댓글의 게시글이 삭제된 경우
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
    const postIdPromises = comments.map(async (comment) => {
      let post: Post;
      if (comment.parent) {
        const parentComment = await this.commentRepository
          .createQueryBuilder('comment')
          .leftJoinAndSelect('comment.post', 'post')
          .leftJoinAndSelect('comment.parent', 'parent')
          .leftJoinAndSelect('comment.author', 'author')
          .where('comment.id = :id', { id: comment.parent.id })
          .withDeleted()
          .getOne();
        post = parentComment.post;
      } else {
        post = comment.post;
      }
      return post.id;
    });

    const postIds = await Promise.all(postIdPromises).then((ids) => {
      return ids.filter(
        (postId, index, self) => self.indexOf(postId) === index,
      );
    });

    const result = await this.commentRepository.softDelete(ids);

    if (result.affected === 0)
      throw new CommentNotFoundException('삭제할 댓글이 없습니다');

    // 게시글들의 댓글 개수 갱신
    for (const postId of postIds) {
      const post =
        await this.postService.findOneWithoutIncrementingViews(postId);
      if (post) {
        await this.updatePostCommentNum(post, -1 * ids.length);
      }
    }
  }

  async update(user: User, id: number, updateData: UpdateCommentDto) {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment)
      throw new CommentNotFoundException('존재하지 않는 댓글입니다');

    if (user.id !== comment.author.id)
      throw new CommentAuthorDifferentException(
        '댓글을 수정할 권한이 없습니다',
      );

    await this.commentRepository.update(id, updateData);
    return this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.id = :id', { id })
      .getOne();
  }

  private async updatePostCommentNum(post: Post, increment: number) {
    post.commentNum += increment;
    const updatedPost = await this.postsRepository.save(post);
    await this.searchService.update(post.id, updatedPost);
  }

  private async notifyPostAuthor(post: Post, commenter: User) {
    // 게시글 작성자에게 알림 전송
    const postAuthor = post.author;
    const notification = await this.notificationService.createNotification(
      postAuthor.id,
      {
        type: NotificationType.COMMENT,
        message: `${commenter.credential.nickname}님이 게시글에 댓글을 남겼습니다`,
      },
    );

    if (postAuthor.isSubscribed) {
      await this.notificationService.sendNotificationToUser(postAuthor.id, {
        type: notification.type,
        message: notification.message,
        subscriberNickname: postAuthor.credential.nickname,
      });
    }
  }
}
