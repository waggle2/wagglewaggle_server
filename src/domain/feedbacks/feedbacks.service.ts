import { Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Feedback } from '@/domain/feedbacks/entities/feedback.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/domain/users/entities/user.entity';
import { AuthorityName } from '@/@types/enum/user.enum';
import {
  FeedbackNotFoundException,
  NotAdminNoPermissionException,
} from '@/domain/feedbacks/exceptions/feedbacks.exception';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private isAdmin(user: User): boolean {
    return user.authorities.some(
      (authority) => authority.authorityName === AuthorityName.ADMIN,
    );
  }

  async create(user: User, createFeedbackDto: CreateFeedbackDto) {
    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      userId: user.id,
    });
    await this.feedbackRepository.save(feedback);

    await this.sendFeedbackToDiscord(feedback);

    return feedback;
  }

  private async sendFeedbackToDiscord(feedback: Feedback) {
    const discordWebhookUrl = this.configService.get('DISCORD_WEBHOOK_URL');
    const response$ = this.httpService.post(discordWebhookUrl, {
      embeds: this.formatFeedbackMessage(feedback),
    });
    await lastValueFrom(response$);
  }

  private formatFeedbackMessage(feedback: Feedback) {
    return [
      {
        title: `#${feedback.id} ${feedback.title}`,
        description: feedback.content,
        timestamp: feedback.createdAt.toISOString(),
        color: 0xffa500,
        fields: [
          {
            name: 'Issue ID',
            value: `#${feedback.id}`,
            inline: true,
          },
          {
            name: 'Timestamp',
            value: feedback.createdAt.toISOString(),
            inline: true,
          },
          { name: 'Email', value: feedback.email, inline: true },
        ],
      },
    ];
  }

  async findAll(user: User, pageOptionsDto: PageOptionsDto) {
    if (!this.isAdmin(user))
      throw new NotAdminNoPermissionException('관리자만 조회할 수 있습니다');
    const { page, pageSize } = pageOptionsDto;
    const queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .orderBy('feedback.createdAt', 'DESC');

    let feedbacks: Feedback[], total: number;

    if (page && pageSize) {
      feedbacks = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();
      total = await queryBuilder.getCount();
    } else {
      feedbacks = await queryBuilder.getMany();
      total = feedbacks.length;
    }

    return { feedbacks, total };
  }

  async findByCurrentUser(user: User) {
    return await this.feedbackRepository
      .createQueryBuilder('feedback')
      .where('feedback.userId = :userId', { userId: user.id })
      .orderBy('feedback.createdAt', 'DESC')
      .getMany();
  }

  async markAsResolved(user: User, id: number) {
    if (!this.isAdmin(user))
      throw new NotAdminNoPermissionException(
        '관리자만 완료 처리할 수 있습니다',
      );
    const feedback = await this.feedbackRepository.findOneBy({ id });

    if (!feedback)
      throw new FeedbackNotFoundException('해당 피드백을 찾을 수 없습니다');

    await this.feedbackRepository.update(id, { resolved: true });
  }
}
