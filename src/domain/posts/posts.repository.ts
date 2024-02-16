import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '@/domain/posts/entities/post.entity';
import { Repository } from 'typeorm';
import { PostFindDto } from '@/domain/posts/dto/post-find.dto';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { PageDto } from '@/common/dto/page/page.dto';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAllWith(postFindDto: PostFindDto, pageOptionsDto: PageOptionsDto) {
    const { text, animal, category, tag } = postFindDto;
    const { page, pageSize } = pageOptionsDto;

    const queryBuilder = this.postsRepository.createQueryBuilder('post');

    if (animal) {
      queryBuilder.andWhere('post.animal = :animal', {
        animal,
      });
    }

    if (tag) {
      queryBuilder.andWhere('post.tag = :tag', {
        tag,
      });
    }

    if (category) {
      queryBuilder.andWhere('post.category = :category', {
        category,
      });
    }

    if (text) {
      queryBuilder.andWhere(
        '(post.title LIKE :text OR post.content LIKE :text)',
        {
          text: `%${text}%`,
        },
      );
    }

    queryBuilder
      .where('post.deleted_at IS NULL')
      .orderBy('post.updated_at', 'DESC')
      .leftJoinAndSelect('post.author', 'author')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }
}
