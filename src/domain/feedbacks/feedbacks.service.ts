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

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
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
    return feedback;
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
