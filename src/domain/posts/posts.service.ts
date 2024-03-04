import { Injectable } from '@nestjs/common';
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
import { SearchHistoriesService } from '@/domain/search-histories/search-histories.service';
import { applyPaging } from '@/common/utils/applyPaging';
import { SearchService } from '@/domain/search/search.service';
import { UsersService } from '@/domain/users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly searchHistoriesService: SearchHistoriesService,
    private readonly searchService: SearchService,
    private readonly usersService: UsersService,
  ) {}

  private createBaseQueryBuilder(options?: {
    withDeleted: boolean;
  }): SelectQueryBuilder<Post> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.credential', 'credential')
      .leftJoinAndSelect('author.profileItems', 'author_profileItems')
      .leftJoinAndSelect('author_profileItems.emoji', 'author_emoji')
      .leftJoinAndSelect('author_profileItems.wallpaper', 'author_wallpaper')
      .leftJoinAndSelect('author_profileItems.background', 'author_background')
      .leftJoinAndSelect('author_profileItems.frame', 'author_frame');

    if (options?.withDeleted) {
      queryBuilder.withDeleted();
    } else {
      queryBuilder.where('post.deletedAt IS NULL');
    }

    return queryBuilder;
  }

  private async ensurePostOwnership(user: User, postId: number) {
    const post = await this.findOneWithoutIncrementingViews(postId);
    const isAuthor = user.id === post.author.id;
    const isAdmin = user.authorities.some(
      (authority) => authority.authorityName === AuthorityName.ADMIN,
    );

    if (!isAuthor && !isAdmin) {
      throw new PostAuthorDifferentException('게시물을 수정할 권한이 없습니다');
    }

    return post;
  }

  async findByUserId(user: User, pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.createBaseQueryBuilder()
      .where('author.id = :userId', { userId: user.id })
      .orderBy('post.createdAt', 'DESC');

    return await applyPaging(queryBuilder, pageOptionsDto);
  }

  async findByComments(user: User, pageOptionsDto: PageOptionsDto) {
    const userId = user.id;
    const queryBuilder = this.createBaseQueryBuilder()
      .leftJoin('post.comments', 'comment')
      .leftJoin('comment.author', 'commenter')
      .andWhere('commenter.id = :userId', { userId });

    const { page, pageSize } = pageOptionsDto;
    let posts: Post[], total: number;

    if (page && pageSize) {
      [posts, total] = await queryBuilder
        .distinct(true)
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();
    } else {
      [posts, total] = await queryBuilder.distinct(true).getManyAndCount();
    }

    return {
      posts,
      total,
    };
  }

  async findHotPosts(pageOptionsDto: PageOptionsDto) {
    const currentDate = new Date();
    const date48HoursAgo = new Date(currentDate);
    date48HoursAgo.setHours(currentDate.getHours() - 48);

    const queryBuilder = this.createBaseQueryBuilder()
      .andWhere('post.updatedAt > :date', { date: date48HoursAgo })
      .addSelect('post.commentNum + LENGTH(post.likes)', 'totalScore') // 댓글과 좋아요를 합친 가중치 적용
      .addOrderBy('totalScore', 'DESC');

    return await applyPaging(queryBuilder, pageOptionsDto);
  }

  async findAll(
    postFindDto: PostFindDto,
    pageOptionsDto: PageOptionsDto,
    userId?: string,
  ) {
    const esQuery = {
      query: {
        bool: {
          must: [],
          must_not: [],
        },
      },
      sort: [
        {
          createdAt: {
            order: 'desc',
          },
        },
      ],
    };

    const { text, animal, category, tag } = postFindDto;
    const { page, pageSize } = pageOptionsDto;

    if (page && pageSize) {
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
      if (userId) {
        await this.searchHistoriesService.create({
          userId,
          keyword: text,
        });
      }
    }

    if (animal) {
      esQuery.query.bool.must.push({
        match: { animalOfAuthor: animal.valueOf() },
      });
    }

    if (category) {
      esQuery.query.bool.must.push({ match: { category: category.valueOf() } });
    }

    if (tag) {
      esQuery.query.bool.must.push({ match: { tag: tag.valueOf() } });
    }

    // 차단한 유저 게시물 제외
    if (userId) {
      const user = await this.usersService.findById(userId);
      const blockedUsers = user.blockedUsers.map(
        (blockedUser) => blockedUser.blockedUser.id,
      );

      blockedUsers.forEach((blockedUser) =>
        esQuery.query.bool.must_not.push({
          match: {
            'author.id': blockedUser,
          },
        }),
      );
    }

    const { total, data } = await this.searchService.search(esQuery);

    return {
      posts: data,
      total: total['value'],
    };
  }

  async findDeletedPosts(pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.createBaseQueryBuilder({
      withDeleted: true,
    }).orderBy('post.updatedAt', 'DESC');
    return await applyPaging(queryBuilder, pageOptionsDto);
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.findOneWithoutIncrementingViews(id);
    post.views++;
    const viewUpdatePost = await this.postRepository.save(post);
    await this.searchService.update(id, viewUpdatePost);
    return viewUpdatePost;
  }

  async findOneWithoutIncrementingViews(id: number) {
    const queryBuilder = this.createBaseQueryBuilder()
      .leftJoinAndSelect('post.poll', 'poll')
      .leftJoinAndSelect('poll.pollItems', 'pollItems')
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

    const savedPost = await this.postRepository.save(newPost);
    await this.searchService.indexPost(savedPost);

    return savedPost;
  }

  async update(user: User, id: number, updateData: UpdatePostDto) {
    await this.ensurePostOwnership(user, id);
    await this.postRepository.update(id, updateData);
    const updatedPost = await this.findOneWithoutIncrementingViews(id);
    await this.searchService.update(id, updatedPost);

    return updatedPost;
  }

  async remove(user: User, id: number) {
    await this.ensurePostOwnership(user, id);
    await this.postRepository.softDelete(id);
    await this.searchService.remove(id);
  }

  async removeMany(user: User, ids: number[]) {
    if (!ids || ids.length === 0)
      throw new PostBadRequestException('삭제할 게시물이 없습니다');

    const deletedPosts = await this.postRepository
      .createQueryBuilder('post')
      .withDeleted()
      .where('post.deletedAt IS NOT NULL')
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
    await this.searchService.removeMany(ids);
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

    const updatedPost = await this.postRepository.save(post);
    await this.searchService.update(postId, updatedPost);

    return updatedPost;
  }

  async cancelLike(user: User, postId: number) {
    const post = await this.findOneWithoutIncrementingViews(postId);

    if (!post.likes.includes(user.id))
      throw new LikeDifferentUserException('잘못된 접근입니다');

    post.likes = post.likes.filter((userId) => userId !== user.id);
    const updatedPost = await this.postRepository.save(post);
    await this.searchService.update(postId, updatedPost);

    return updatedPost;
  }
}
