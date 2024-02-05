import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '@/domain/reports/entities/report.entity';
import { PostsModule } from '@/domain/posts/posts.module';
import { CommentsModule } from '@/domain/comments/comments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report]), PostsModule, CommentsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
