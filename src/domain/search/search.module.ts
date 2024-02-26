import { Module, OnModuleInit } from '@nestjs/common';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '@/domain/posts/entities/post.entity';

@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ES_NODE'),
        maxRetries: 10,
        requestTimeout: 6000,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Post]),
  ],
  exports: [SearchService],
  providers: [SearchService],
})
export class SearchModule implements OnModuleInit {
  constructor(private readonly searchService: SearchService) {}

  async onModuleInit() {
    await this.searchService.createIndex();
    await this.searchService.migrate();
  }
}
