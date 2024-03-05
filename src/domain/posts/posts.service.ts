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
import { Category } from '@/@types/enum/category.enum';
import {
  NeedSelfVerificationException,
  NotAdultException,
  UserBlockForbiddenException,
} from '@/domain/authentication/exceptions/authentication.exception';

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
      .withDeleted()
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
    const post = await this.findOneWithoutIncrementingViews(postId, user?.id);
    const isAuthor = user.id === post.author.id;
    const isAdmin = user.authorities.some(
      (authority) => authority.authorityName === AuthorityName.ADMIN,
    );

    if (!isAuthor && !isAdmin) {
      throw new PostAuthorDifferentException('게시물을 수정할 권한이 없습니다');
    }

    return post;
  }

  private async appendBlockedUsersFilter(
    queryBuilder: SelectQueryBuilder<Post>,
    user: User,
  ) {
    const blockedUsers = user.usersBlockedByThisUser;
    if (blockedUsers.length > 0) {
      queryBuilder.andWhere('author.id NOT IN (:...blockedUsers)', {
        blockedUsers,
      });
    }

    return queryBuilder;
  }

  async findByUserId(user: User, pageOptionsDto: PageOptionsDto) {
    const queryBuilder = this.createBaseQueryBuilder()
      .where('author.id = :userId', { userId: user.id })
      .orderBy('post.createdAt', 'DESC');

    return await applyPaging(queryBuilder, pageOptionsDto);
  }

  async findByComments(user: User, pageOptionsDto: PageOptionsDto) {
    let queryBuilder = this.createBaseQueryBuilder()
      .leftJoin('post.comments', 'comment')
      .leftJoin('comment.author', 'commenter')
      .andWhere('commenter.id = :userId', { userId: user.id });

    queryBuilder = await this.appendBlockedUsersFilter(queryBuilder, user);

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

  async findHotPosts(pageOptionsDto: PageOptionsDto, userId?: string) {
    const currentDate = new Date();
    const date48HoursAgo = new Date(currentDate);
    date48HoursAgo.setHours(currentDate.getHours() - 48);

    let queryBuilder = this.createBaseQueryBuilder()
      .andWhere('post.createdAt > :date', { date: date48HoursAgo })
      .addSelect('post.commentNum + LENGTH(post.likes)', 'totalScore') // 댓글과 좋아요를 합친 가중치 적용
      .addOrderBy('totalScore', 'DESC');

    if (userId) {
      const user = await this.usersService.findById(userId);
      queryBuilder = await this.appendBlockedUsersFilter(queryBuilder, user);

      // 성인 카테고리
      const currentYear = new Date().getFullYear();
      const isAdult = currentYear - user.credential.birthYear >= 19;

      if (!user.isVerified || !isAdult) {
        queryBuilder.andWhere('post.category != :category', {
          category: Category.ADULT.valueOf(),
        });
      }
    } else {
      queryBuilder.andWhere('post.category != :category', {
        category: Category.ADULT.valueOf(),
      });
    }

    return await applyPaging(queryBuilder, pageOptionsDto);
  }

  private initializeEsQuery() {
    return {
      query: { bool: { must: [], must_not: [] } },
      sort: [{ createdAt: { order: 'desc' } }],
    };
  }

  private applyPagination(esQuery, { page, pageSize }) {
    if (page && pageSize) {
      esQuery['from'] = (page - 1) * pageSize;
      esQuery['size'] = pageSize;
    }
  }

  private async addTextFilter(esQuery, text: string, userId?: string) {
    esQuery.query.bool.must.push({
      multi_match: { query: text, fields: ['title', 'content'] },
    });

    if (userId) {
      await this.searchHistoriesService.create({ userId, keyword: text });
    }
  }

  private addMatchFilter(esQuery, field: string, value: string) {
    esQuery.query.bool.must.push({ match: { [field]: value } });
  }

  private addMustNotMatchFilter(esQuery, field: string, value: string) {
    esQuery.query.bool.must_not.push({ match: { [field]: value } });
  }

  private async isVerifiedAdultUser(userId: string) {
    const user = await this.usersService.findByIdWithDeleted(userId);
    const currentYear = new Date().getFullYear();
    const isAdult = currentYear - user.credential.birthYear >= 19;
    return user.isVerified && isAdult;
  }

  private async verifyAdultUser(userId: string) {
    if (!userId)
      throw new NeedSelfVerificationException('본인 인증이 필요합니다.');

    const isVerifiedAdult = await this.isVerifiedAdultUser(userId);
    if (!isVerifiedAdult)
      throw new NotAdultException('성인 인증에 실패했습니다.');
  }

  private async addCategoryFilter(
    esQuery,
    category: Category,
    userId?: string,
  ) {
    if (category === Category.ADULT) {
      await this.verifyAdultUser(userId);
    }

    this.addMatchFilter(esQuery, 'category', category.valueOf());
  }

  private async excludeAdultCategoryIfNecessary(esQuery, userId?: string) {
    if (userId && !(await this.isVerifiedAdultUser(userId))) {
      this.addMustNotMatchFilter(esQuery, 'category', Category.ADULT);
    } else if (!userId) {
      this.addMustNotMatchFilter(esQuery, 'category', Category.ADULT);
    }
  }

  private async excludeBlockedUsers(esQuery, userId?: string) {
    if (userId) {
      const user = await this.usersService.findById(userId);
      user.usersBlockedByThisUser?.forEach((blockedUser) => {
        this.addMustNotMatchFilter(esQuery, 'author.id', blockedUser);
      });
    }
  }

  private async applyFilters(
    esQuery,
    { text, animal, category, tag },
    userId?: string,
  ) {
    if (text) {
      await this.addTextFilter(esQuery, text, userId);
    }

    if (animal) {
      this.addMatchFilter(esQuery, 'animalOfAuthor', animal.valueOf());
    }

    if (category) {
      await this.addCategoryFilter(esQuery, category, userId);
    } else {
      await this.excludeAdultCategoryIfNecessary(esQuery, userId);
    }

    if (tag) {
      this.addMatchFilter(esQuery, 'tag', tag.valueOf());
    }

    await this.excludeBlockedUsers(esQuery, userId);
  }

  private isUserAdult(user: User) {
    const currentYear = new Date().getFullYear();
    return currentYear - user.credential.birthYear >= 19;
  }

  private checkPostAccessForUser(post: Post, user?: User) {
    if (post.category === Category.ADULT) {
      if (!user) {
        throw new NotAdultException('성인 인증이 필요한 게시물입니다.');
      }
      if (!user.isVerified) {
        throw new NeedSelfVerificationException('본인 인증이 필요합니다.');
      }
      if (!this.isUserAdult(user)) {
        throw new NotAdultException('성인 인증이 필요한 게시물입니다.');
      }
    }
    if (user && user.usersBlockedByThisUser?.includes(post.author.id)) {
      throw new UserBlockForbiddenException(
        '차단한 유저의 게시물은 볼 수 없습니다',
      );
    }
  }

  async findAll(
    postFindDto: PostFindDto,
    pageOptionsDto: PageOptionsDto,
    userId?: string,
  ) {
    const esQuery = this.initializeEsQuery();
    this.applyPagination(esQuery, pageOptionsDto);
    await this.applyFilters(esQuery, postFindDto, userId);

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

  async findOne(id: number, userId?: string): Promise<Post> {
    const post = await this.findOneWithoutIncrementingViews(id, userId);

    // 게시글 조회수 증가
    post.views++;
    const viewUpdatePost = await this.postRepository.save(post);
    await this.searchService.update(id, viewUpdatePost);

    return viewUpdatePost;
  }

  async findOneWithoutIncrementingViews(
    id: number,
    userId?: string,
  ): Promise<Post> {
    let queryBuilder = this.createBaseQueryBuilder()
      .leftJoinAndSelect('post.poll', 'poll')
      .leftJoinAndSelect('poll.pollItems', 'pollItems')
      .andWhere('post.id = :id', { id });

    let user: User;
    if (userId) {
      user = await this.usersService.findById(userId);
      queryBuilder = await this.appendBlockedUsersFilter(queryBuilder, user);
    }

    const post = await queryBuilder.getOne();
    if (!post) throw new PostNotFoundException('존재하지 않는 게시물입니다.');

    this.checkPostAccessForUser(post, user);

    return post;
  }

  async create(user: User, postData: CreatePostDto) {
    const { category } = postData;

    if (category === Category.ADULT.valueOf()) {
      const currentYear = new Date().getFullYear();
      const isAdult = currentYear - user.credential.birthYear >= 19;

      if (!user.isVerified)
        throw new NeedSelfVerificationException('본인 인증이 필요합니다.');

      if (!isAdult) throw new NotAdultException('성인 인증이 필요합니다.');
    }

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
