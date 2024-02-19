import { Module } from '@nestjs/common';
import { SearchHistoriesService } from './search-histories.service';
import { SearchHistoriesController } from './search-histories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHistory } from '@/domain/search-histories/entities/search-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchHistory])],
  exports: [SearchHistoriesService],
  controllers: [SearchHistoriesController],
  providers: [SearchHistoriesService],
})
export class SearchHistoriesModule {}
