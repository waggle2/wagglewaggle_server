import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from '@/domain/likes/entities/like.entity';
import { Repository } from 'typeorm';
import { PostsService } from '@/domain/posts/posts.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
    private readonly postsService: PostsService,
  ) {}

  async create(postId: number) {
    // user가 해당 post에 이미 좋아요를 눌렀으면 conflict
    const post = await this.postsService.findOne(postId);
    const like = this.likesRepository.create({
      post: { id: post?.id },
    });
    return await this.likesRepository.save(like);
  }

  async remove(id: number) {
    await this.likesRepository.delete(id);
  }
}
