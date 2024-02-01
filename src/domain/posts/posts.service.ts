import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Tag } from '@/domain/types/enum/tags.enum';
import { Animal } from '@/domain/types/enum/animal.enum';
import {
  PostBadRequestException,
  PostNotFoundException,
} from '@/exceptions/domain/posts.exception';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  private async findPosts(
    queryBuilder: SelectQueryBuilder<Post>,
    page: number,
    pageSize: number,
  ): Promise<{ posts: Post[]; total: number }> {
    let posts: Post[], total: number;

    if (page && pageSize) {
      [posts, total] = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();
    } else {
      // 페이지 관련 파라미터가 없는 경우, 페이징을 적용하지 않음
      [posts, total] = await queryBuilder.getManyAndCount();
    }

    return {
      posts,
      total,
    };
  }

  async findAll(
    animal: Animal,
    tags: Tag | Tag[],
    page: number,
    pageSize: number,
  ) {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.deleted_at IS NULL');

    if (animal) {
      queryBuilder.andWhere('post.animal = :animal', {
        animal: animal.valueOf(),
      });
    }

    if (tags && tags.length > 0) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];

      const tagConditions = tagsArray.map(
        (tag, index) => `JSON_CONTAINS(post.tags, :tag${index})`,
      );
      const parameters = tagsArray.reduce((params, tag, index) => {
        params[`tag${index}`] = JSON.stringify(tag);
        return params;
      }, {});

      queryBuilder.andWhere(`(${tagConditions.join(' AND ')})`, parameters);
    }

    queryBuilder.addOrderBy('post.updated_at', 'DESC');

    return await this.findPosts(queryBuilder, page, pageSize);
  }

  async findHotPosts(page: number, pageSize: number) {
    const currentDate = new Date();
    const date48HoursAgo = new Date(currentDate);
    date48HoursAgo.setHours(currentDate.getHours() - 48);

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.deleted_at IS NULL')
      .andWhere('post.updated_at > :date', { date: date48HoursAgo })
      .addSelect('post.comment_num + post.like_num', 'totalScore') // 댓글과 좋아요를 합친 가중치 적용
      .addOrderBy('totalScore', 'DESC');

    return await this.findPosts(queryBuilder, page, pageSize);
  }

  async findDeletedPosts(page: number, pageSize: number) {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .withDeleted()
      .where('post.deleted_at IS NOT NULL')
      .orderBy('post.updated_at', 'DESC');

    return await this.findPosts(queryBuilder, page, pageSize);
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.findOneWithoutIncrementingViews(id);
    post.views++;
    return await this.postRepository.save(post);
  }

  async create(postData: CreatePostDto) {
    const newPost = this.postRepository.create({ ...postData, views: 1 });
    return await this.postRepository.save(newPost);
  }

  async findOneWithoutIncrementingViews(id: number) {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.poll', 'poll')
      .leftJoinAndSelect('poll.pollItems', 'pollItems')
      .where('post.deleted_at IS NULL')
      .andWhere('post.id = :id', { id });

    const post = await queryBuilder.getOne();
    if (!post) throw new PostNotFoundException('존재하지 않는 게시글입니다.');

    return post;
  }

  async update(id: number, updateData: UpdatePostDto) {
    await this.findOneWithoutIncrementingViews(id);
    await this.postRepository.update(id, updateData);
    return this.findOneWithoutIncrementingViews(id);
  }

  async remove(id: number) {
    const existingPost = await this.findOneWithoutIncrementingViews(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found.`);
    }
    return await this.postRepository.softDelete(id);
  }

  async removeMany(ids: number[]) {
    if (!ids || ids.length === 0)
      throw new PostBadRequestException('삭제할 게시글이 없습니다');

    const result = await this.postRepository.softDelete(ids);

    if (result.affected === 0)
      throw new PostNotFoundException('삭제할 게시글이 없습니다');
  }
}
