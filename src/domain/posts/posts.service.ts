import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Tag } from '@/domain/types/enum/tags.enum';
import { Animal } from '@/domain/types/enum/animal.enum';
import { PaginationOptions } from '@/domain/types/interface/pagination-option.interface';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(
    animal: Animal,
    tags: Tag | Tag[],
    paginationOptions?: PaginationOptions,
  ) {
    const { page, pageSize } = paginationOptions;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.poll', 'poll')
      .leftJoinAndSelect('poll.pollItems', 'pollItems')
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

    const [posts, total] = await queryBuilder
      .orderBy('post.updated_at', 'DESC')
      .skip(page * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { posts, total };
  }

  async findHotPosts(paginationOptions: PaginationOptions) {
    const { page, pageSize } = paginationOptions;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.poll', 'poll')
      .leftJoinAndSelect('poll.pollItems', 'pollItems')
      .where('post.deleted_at IS NULL');

    queryBuilder.andWhere(
      'post.updated_at > :date',
      new Date(Date.now() - 48 * 60 * 60 * 1000), // 최근 48시간 이내의 게시물
    );

    const [hotPosts, total] = await queryBuilder
      .orderBy('post.comment_num', 'DESC')
      .addOrderBy('post.like_num', 'DESC')
      .skip(page * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { hotPosts, total };
  }

  async findOne(id: number): Promise<Post | null> {
    const post = await this.postRepository.findOne({
      where: { id, deletedAt: undefined },
      relations: ['comments'],
    });
    if (!post) throw new NotFoundException('게시글이 존재하지 않습니다.');
    return post;
  }

  async create(postData: CreatePostDto) {
    const newPost = this.postRepository.create(postData);
    return await this.postRepository.save(newPost);
  }

  async remove(id: number) {
    const existingPost = await this.postRepository.findOne({
      where: { id, deletedAt: undefined },
    });
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found.`);
    }

    return await this.postRepository.softDelete(id);
  }

  async update(id: number, updateData: UpdatePostDto) {
    // 먼저 해당 id의 Post가 존재하는지 확인
    const existingPost = await this.findOne(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found.`);
    }

    // Post가 존재하면 업데이트 진행
    await this.postRepository.update(id, updateData);

    // 업데이트된 Post 반환
    return this.findOne(id);
  }
}
