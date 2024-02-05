import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from '@/domain/likes/entities/like.entity';
import { Repository } from 'typeorm';
import { PostsService } from '@/domain/posts/posts.service';
import { Post } from '@/domain/posts/entities/post.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly postsService: PostsService,
  ) {}

  async create(postId: number) {
    // user가 해당 post에 이미 좋아요를 눌렀으면 conflict
    const post =
      await this.postsService.findOneWithoutIncrementingViews(postId);
    const like = this.likesRepository.create({
      post: { id: post?.id },
    });

    await this.updatePostLikeNum(post, 1);

    return await this.likesRepository.save(like);
  }

  async remove(id: number) {
    const like = await this.likesRepository
      .createQueryBuilder('likes')
      .leftJoinAndSelect('likes.post', 'post')
      .andWhere('likes.id = :id', { id })
      .getOne();
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
