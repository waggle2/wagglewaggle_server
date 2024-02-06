import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from '@/domain/likes/entities/like.entity';
import { Repository } from 'typeorm';
import { PostsService } from '@/domain/posts/posts.service';
import { Post } from '@/domain/posts/entities/post.entity';
import { User } from '@/domain/users/entities/user.entity';
import {
  AlreadyLikeException,
  LikeDifferentUserException,
} from '@/domain/likes/exceptions/likes.exception';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly postsService: PostsService,
  ) {}

  async create(user: User, postId: number) {
    const post =
      await this.postsService.findOneWithoutIncrementingViews(postId);

    const userIds = post.likes.map((like) => like.userId);

    if (userIds.includes(user.id))
      throw new AlreadyLikeException('이미 좋아요를 누른 게시물입니다');

    const like = this.likesRepository.create({
      post: { id: post?.id },
      userId: user.id,
    });

    await this.updatePostLikeNum(post, 1);

    return await this.likesRepository.save(like);
  }

  async remove(user: User, id: number) {
    const like = await this.likesRepository
      .createQueryBuilder('likes')
      .leftJoinAndSelect('likes.post', 'post')
      .andWhere('likes.id = :id', { id })
      .getOne();

    if (user.id !== like.userId)
      throw new LikeDifferentUserException('잘못된 접근입니다');

    const post = like.post;

    await this.likesRepository.delete(id);
    await this.updatePostLikeNum(post, -1);
  }

  private async updatePostLikeNum(
    post: Post,
    increment: number,
  ): Promise<void> {
    post.likeNum += increment;
    await this.postsRepository.save(post);
  }
}
