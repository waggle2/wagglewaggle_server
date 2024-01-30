import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from '@/domain/posts/posts.service';
import { CommentsService } from '@/domain/comments/comments.service';
import { Report } from '@/domain/reports/entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  async reportPost(postId: number, createReportDto: CreateReportDto) {
    await this.postsService.findOne(postId);
    const postReport = this.reportsRepository.create({
      ...createReportDto,
      // user
      postId,
    });
    return await this.reportsRepository.save(postReport);
  }

  async reportComment(commentId: number, createReportDto: CreateReportDto) {
    await this.commentsService.findOne(commentId);
    const commentReport = this.reportsRepository.create({
      ...createReportDto,
      // user
      commentId,
    });
    return await this.reportsRepository.save(commentReport);
  }

  async findAll() {
    const queryBuilder = this.reportsRepository
      .createQueryBuilder('reports')
      .leftJoinAndSelect('reports.reporter', 'reporter')
      .where('reports.deleted_at IS NULL');

    return await queryBuilder.getMany();
  }

  async findOne(id: number) {
    const queryBuilder = this.reportsRepository
      .createQueryBuilder('reports')
      .leftJoinAndSelect('reports.reporter', 'reporter')
      .where('reports.deleted_at IS NULL')
      .andWhere('reports.id = :id', { id });

    return await queryBuilder.getOne();
  }
}
