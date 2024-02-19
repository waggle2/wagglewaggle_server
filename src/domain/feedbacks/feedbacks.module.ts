import { Module } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { FeedbacksController } from './feedbacks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from '@/domain/feedbacks/entities/feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  controllers: [FeedbacksController],
  providers: [FeedbacksService],
})
export class FeedbacksModule {}
