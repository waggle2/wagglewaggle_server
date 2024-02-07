import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from '@/domain/posts/posts.service';
import { CommentsService } from '@/domain/comments/comments.service';
import { Report } from '@/domain/reports/entities/report.entity';
import { User } from '@/domain/users/entities/user.entity';
import { AuthorityName } from '@/@types/enum/user.enum';
import { UserReportForbiddenException } from '@/lib/exceptions/domain/authentication.exception';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  private isAdmin(user: User): boolean {
    return user.authorities.some(
      (authority) => authority.authorityName === AuthorityName.ADMIN,
    );
  }

  private async findReports() {
    return this.reportsRepository
      .createQueryBuilder('reports')
      .leftJoinAndSelect('reports.reporter', 'reporter')
      .where('reports.deleted_at IS NULL');
  }

  async reportPost(
    user: User,
    postId: number,
    createReportDto: CreateReportDto,
  ) {
    await this.postsService.findOneWithoutIncrementingViews(postId);
    const postReport = this.reportsRepository.create({
      ...createReportDto,
      reporter: { id: user.id },
      postId,
    });
    return await this.reportsRepository.save(postReport);
  }

  async reportComment(
    user: User,
    commentId: number,
    createReportDto: CreateReportDto,
  ) {
    await this.commentsService.findOne(commentId);
    const commentReport = this.reportsRepository.create({
      ...createReportDto,
      reporter: { id: user.id },
      commentId,
    });
    return await this.reportsRepository.save(commentReport);
  }

  async findAll(user: User) {
    if (!this.isAdmin(user))
      throw new UserReportForbiddenException('접근 권한이 없습니다');

    const queryBuilder = await this.findReports();
    return queryBuilder.getMany();
  }

  async findOne(user: User, id: number) {
    if (!this.isAdmin(user))
      throw new UserReportForbiddenException('접근 권한이 없습니다');

    const queryBuilder = await this.findReports();
    return queryBuilder.andWhere('reports.id = :id', { id }).getOne();
  }
}
