import { Injectable } from '@nestjs/common';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';
import { SearchHistory } from '@/domain/search-histories/entities/search-history.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/domain/users/entities/user.entity';
import { SearchHistoryDifferentUserException } from '@/domain/search-histories/exceptions/search-histories.exception';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';

@Injectable()
export class SearchHistoriesService {
  constructor(
    @InjectRepository(SearchHistory)
    private readonly searchHistoryRepository: Repository<SearchHistory>,
  ) {}

  async create(createSearchHistoryDto: CreateSearchHistoryDto) {
    const { userId, keyword } = createSearchHistoryDto;
    const history = await this.searchHistoryRepository.findOneBy({
      keyword,
      userId,
    });

    if (history) {
      await this.searchHistoryRepository.update(history.id, {
        updatedAt: new Date(),
      });
      return;
    }

    await this.searchHistoryRepository.save(createSearchHistoryDto);
  }

  async findByCurrentUser(user: User, pageOptionsDto: PageOptionsDto) {
    const { page, pageSize } = pageOptionsDto;

    return await this.searchHistoryRepository
      .createQueryBuilder('search_histories')
      .where('search_histories.user_id = :userId', { userId: user.id })
      .orderBy('search_histories.updatedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  async remove(user: User, id: number) {
    const history = await this.searchHistoryRepository.findOneBy({ id });
    if (history.userId !== user.id) {
      throw new SearchHistoryDifferentUserException(
        '다른 사용자의 검색 히스토리는 삭제할 수 없습니다',
      );
    }
    await this.searchHistoryRepository.delete(id);
  }

  async removeAllByCurrentUser(user: User) {
    await this.searchHistoryRepository
      .createQueryBuilder('search_histories')
      .delete()
      .where('search_histories.user_id = :userId', { userId: user.id })
      .execute();
  }
}
