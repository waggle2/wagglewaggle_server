import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Tag } from '@/domain/types/enum/tags.enum';
import { Animal } from '@/domain/types/enum/animal.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

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

  async findHotPosts(page: number, pageSize: number) {
    const currentDate = new Date();
    const date48HoursAgo = new Date(currentDate);
    date48HoursAgo.setHours(currentDate.getHours() - 48);

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.deleted_at IS NULL')
      .andWhere('post.updated_at > :date', { date: date48HoursAgo })
      .addOrderBy('post.comment_num', 'DESC')
      .addOrderBy('post.like_num', 'DESC');

    let hotPosts: Post[], total: number;

    if (page && pageSize) {
      [hotPosts, total] = await queryBuilder
        .skip(page * pageSize)
        .take(pageSize)
        .getManyAndCount();
    } else {
      [hotPosts, total] = await queryBuilder.getManyAndCount();
    }

    return {
      hotPosts,
      total,
    };
  }

  async findDeletedPosts(page: number, pageSize: number) {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.deleted_at IS NOT NULL')
      .orderBy('post.updated_at', 'DESC');

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
      data: posts,
      meta: { total, page, last_page: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: number): Promise<Post | null> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.replies', 'replies')
      .leftJoinAndSelect('comments.stickers', 'stickers')
      .leftJoinAndSelect('post.poll', 'poll')
      .leftJoinAndSelect('poll.pollItems', 'pollItems')
      .where('post.deleted_at IS NULL')
      .andWhere('post.id = :id', { id });

    const post = await queryBuilder.getOne();

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
