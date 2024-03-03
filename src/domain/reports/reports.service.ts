import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from '@/domain/posts/posts.service';
import { CommentsService } from '@/domain/comments/comments.service';
import { Report } from '@/domain/reports/entities/report.entity';
import { User } from '@/domain/users/entities/user.entity';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { MessagesService } from '../messages/messages.service';
import { MessageBadRequestException } from '../messages/exceptions/message.exception';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly messagesService: MessagesService,
  ) {}

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

  async reportMessageRoom(
    user: User,
    messageRoomId: number,
    createReportDto: CreateReportDto,
  ) {
    await this.messagesService.getRoom(messageRoomId, user);
    const messageRoomReport = this.reportsRepository.create({
      ...createReportDto,
      reporter: { id: user.id },
      messageRoomId,
    });
    return await this.reportsRepository.save(messageRoomReport);
  }

  async reportMessage(
    user: User,
    messageId: number,
    createReportDto: CreateReportDto,
  ) {
    const message = await this.messagesService.findMessage(messageId);
    if (message.receiver.id !== user.id) {
      throw new MessageBadRequestException(
        '신고한 유저가 받은 메세지가 아닙니다.',
      );
    }

    const messageReport = this.reportsRepository.create({
      ...createReportDto,
      reporter: { id: user.id },
      messageId,
    });
    return await this.reportsRepository.save(messageReport);
  }

  async findAll(pageOptionsDto: PageOptionsDto) {
    const { page, pageSize } = pageOptionsDto;

    const queryBuilder = await this.findReports();
    let reports: Report[], total: number;

    if (page && pageSize) {
      [reports, total] = await queryBuilder
        .skip(pageSize * (page - 1))
        .take(pageSize)
        .getManyAndCount();
    } else {
      reports = await queryBuilder.getMany();
      total = reports.length;
    }

    return { reports, total };
  }

  async findOne(id: number) {
    const queryBuilder = await this.findReports();
    return queryBuilder.andWhere('reports.id = :id', { id }).getOne();
  }
}
