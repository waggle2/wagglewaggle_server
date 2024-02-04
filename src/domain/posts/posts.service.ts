import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Tag } from '@/@types/enum/tags.enum';
import { Animal } from '@/@types/enum/animal.enum';
import {
  PostBadRequestException,
  PostNotFoundException,
} from '@/lib/exceptions/domain/posts.exception';
import { Category } from '@/@types/enum/category.enum';
import { SearchService } from '@/domain/search/search.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly searchService: SearchService,
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
    text: string,
    animal: Animal,
    category: Category,
    tags: Tag | Tag[],
    page: number,
    pageSize: number,
  ) {
    const esQuery = {
      query: {
        bool: {
          must: [],
        },
      },
      sort: [
        {
          updatedAt: {
            order: 'desc',
          },
        },
      ],
    };

    if (pageSize) {
      esQuery['from'] = (page - 1) * pageSize;
      esQuery['size'] = pageSize;
    }

    if (text) {
      esQuery.query.bool.must.push({
        multi_match: {
          query: text,
          fields: ['title', 'content'],
        },
      });
    }

    if (animal) {
      esQuery.query.bool.must.push({
        match: { preferredResponseAnimal: animal.valueOf() },
      });
    }

    if (category) {
      esQuery.query.bool.must.push({ match: { category: category.valueOf() } });
    }

    if (tags && tags.length > 0) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      tagsArray.map((tag: Tag) => {
        esQuery.query.bool.must.push({
          match: { tags: tag.valueOf() },
        });
      });
    }

    return await this.searchService.search(esQuery);
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

  async create(postData: CreatePostDto) {
    const newPost = this.postRepository.create({ ...postData, views: 1 });
    const post = await this.postRepository.save(newPost);

    await this.searchService.indexPost(post);

    return post;
  }

  async update(id: number, updateData: UpdatePostDto) {
    await this.findOneWithoutIncrementingViews(id);
    await this.postRepository.update(id, updateData);

    const updatedPost = await this.findOneWithoutIncrementingViews(id);
    await this.searchService.update(id, updatedPost);

    return updatedPost;
  }

  async remove(id: number) {
    const existingPost = await this.findOneWithoutIncrementingViews(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found.`);
    }
    await this.postRepository.softDelete(id);
    await this.searchService.remove(id);
  }

  async removeMany(ids: number[]) {
    if (!ids || ids.length === 0)
      throw new PostBadRequestException('삭제할 게시글이 없습니다');

    const result = await this.postRepository.softDelete(ids);

    if (result.affected === 0)
      throw new PostNotFoundException('삭제할 게시글이 없습니다');

    await this.searchService.removeMany(ids);
  }
}
