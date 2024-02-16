import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  PostAlreadyDeletedException,
  PostAuthorDifferentException,
  PostBadRequestException,
  PostNotFoundException,
} from '@/domain/posts/exceptions/posts.exception';
import { User } from '@/domain/users/entities/user.entity';
import { AuthorityName } from '@/@types/enum/user.enum';
import {
  AlreadyLikeException,
  LikeDifferentUserException,
} from '@/domain/posts/exceptions/likes.exception';
import { PostFindDto } from '@/domain/posts/dto/post-find.dto';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';

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

  async findAll(postFindDto: PostFindDto, pageOptionDto: PageOptionsDto) {
    const { text, animal, category, tag } = postFindDto;
    const { page, pageSize } = pageOptionDto;

    try {
      const queryBuilder = this.postRepository
        .createQueryBuilder('posts')
        .leftJoinAndSelect('posts.author', 'author')
        .where('posts.deleted_at IS NULL');

      if (animal) {
        queryBuilder.andWhere('posts.animal = :animal', {
          animal,
        });
      }

      if (tag) {
        queryBuilder.andWhere('posts.tag = :tag', {
          tag: tag.valueOf(),
        });
      }

      if (category) {
        queryBuilder.andWhere('posts.category = :category', {
          category,
        });
      }

      if (text) {
        queryBuilder.andWhere(
          '(posts.title LIKE :text OR posts.content LIKE :text)',
          {
            text: `%${text}%`,
          },
        );
      }

      queryBuilder.addOrderBy('posts.updated_at', 'DESC');

      return await this.findPosts(queryBuilder, page, pageSize);
    } catch (e) {
      console.log(e);
    }
    // const esQuery = {
    //   query: {
    //     bool: {
    //       must: [],
    //     },
    //   },
    //   sort: [
    //     {
    //       updatedAt: {
    //         order: 'desc',
    //       },
    //     },
    //   ],
    // };
    //
    // if (page && pageSize) {
    //   esQuery['from'] = (page - 1) * pageSize;
    //   esQuery['size'] = pageSize;
    // }
    //
    // if (text) {
    //   esQuery.query.bool.must.push({
    //     multi_match: {
    //       query: text,
    //       fields: ['title', 'content'],
    //     },
    //   });
    // }
    //
    // if (animal) {
    //   esQuery.query.bool.must.push({
    //     match: { animalOfAuthor: animal.valueOf() },
    //   });
    // }
    //
    // if (category) {
    //   esQuery.query.bool.must.push({ match: { category: category.valueOf() } });
    // }
    //
    // if (tags && tags.length > 0) {
    //   const tagsArray = Array.isArray(tags) ? tags : [tags];
    //   tagsArray.forEach((tag: Tag) => {
    //     esQuery.query.bool.must.push({
    //       match: { tags: tag.valueOf() },
    //     });
    //   });
    // }
  }

  async findHotPosts(pageOptionDto: PageOptionsDto) {
    const { page, pageSize } = pageOptionDto;
    const currentDate = new Date();
    const date48HoursAgo = new Date(currentDate);
    date48HoursAgo.setHours(currentDate.getHours() - 48);

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.deleted_at IS NULL')
      .andWhere('post.updated_at > :date', { date: date48HoursAgo })
      .addSelect('post.comment_num + LENGTH(post.likes)', 'totalScore') // 댓글과 좋아요를 합친 가중치 적용
      .addOrderBy('totalScore', 'DESC');

    return await this.findPosts(queryBuilder, page, pageSize);
  }

  async findDeletedPosts(pageOptionDto: PageOptionsDto) {
    const { page, pageSize } = pageOptionDto;
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
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.poll', 'poll')
      .leftJoinAndSelect('poll.pollItems', 'pollItems')
      .where('post.deleted_at IS NULL')
      .andWhere('post.id = :id', { id });

    const post = await queryBuilder.getOne();
    if (!post) throw new PostNotFoundException('존재하지 않는 게시물입니다.');

    return post;
  }

  async create(user: User, postData: CreatePostDto) {
    const newPost = this.postRepository.create({
      ...postData,
      author: user,
      animalOfAuthor: user.primaryAnimal, // 글 작성 당시의 유저 동물을 저장
      views: 1,
    });

    // await this.searchService.indexPost(post);

    return await this.postRepository.save(newPost);
  }

  async update(user: User, id: number, updateData: UpdatePostDto) {
    const post = await this.findOneWithoutIncrementingViews(id);

    if (user.id !== post.author.id)
      throw new PostAuthorDifferentException('게시물을 수정할 권한이 없습니다');

    await this.postRepository.update(id, updateData);
    // await this.searchService.update(id, updatedPost);

    return await this.findOneWithoutIncrementingViews(id);
  }

  async remove(user: User, id: number) {
    const existingPost = await this.findOneWithoutIncrementingViews(id);

    if (!existingPost) {
      throw new NotFoundException(`존재하지 않는 게시물입니다`);
    }

    const userAuthorities = user.authorities.map(
      (authority) => authority.authorityName,
    );

    const isAuthorOrAdmin =
      user.id === existingPost.author.id ||
      userAuthorities.includes(AuthorityName.ADMIN);

    if (!isAuthorOrAdmin)
      throw new PostAuthorDifferentException('게시물을 삭제할 권한이 없습니다');

    await this.postRepository.softDelete(id);
    // await this.searchService.remove(id);
  }

  async removeMany(user: User, ids: number[]) {
    if (!ids || ids.length === 0)
      throw new PostBadRequestException('삭제할 게시물이 없습니다');

    const deletedPosts = await this.postRepository
      .createQueryBuilder('post')
      .withDeleted()
      .where('post.deleted_at IS NOT NULL')
      .getMany();

    const deletedPostsIds = deletedPosts.map((post) => post.id);

    for (const id of ids) {
      if (deletedPostsIds.includes(id)) {
        throw new PostAlreadyDeletedException('잘못된 접근입니다');
      }
    }

    const posts = await this.postRepository.find({
      where: {
        id: In(ids),
      },
      relations: ['author'],
    });

    const userAuthorities = user.authorities.map(
      (authority) => authority.authorityName,
    );

    for (const post of posts) {
      const isAuthorOrAdmin =
        user.id === post.author.id ||
        userAuthorities.includes(AuthorityName.ADMIN);

      if (!isAuthorOrAdmin)
        throw new PostAuthorDifferentException(
          '게시물을 삭제할 권한이 없습니다',
        );
    }

    const result = await this.postRepository.softDelete(ids);

    if (result.affected === 0)
      throw new PostNotFoundException('삭제할 게시물이 없습니다');
    // await this.searchService.removeMany(ids);
  }

  async likePost(user: User, postId: number) {
    const post = await this.findOneWithoutIncrementingViews(postId);

    if (!post.likes) {
      post.likes = [user.id];
    } else {
      if (post.likes.includes(user.id)) {
        throw new AlreadyLikeException('이미 좋아요를 누른 게시물입니다');
      }
      post.likes.push(user.id);
    }

    await this.postRepository.save(post);
  }

  async cancelLike(user: User, postId: number) {
    const post = await this.findOneWithoutIncrementingViews(postId);

    if (!post.likes.includes(user.id))
      throw new LikeDifferentUserException('잘못된 접근입니다');

    post.likes = post.likes.filter((userId) => userId !== user.id);
    await this.postRepository.save(post);
  }
}
