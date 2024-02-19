import { Module } from '@nestjs/common';
import { PollItemsService } from './pollItems.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollItem } from './entities/pollItem.entity';
import { Poll } from '@/domain/polls/entities/poll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PollItem, Poll])],
  exports: [PollItemsService],
  providers: [PollItemsService],
})
export class PollItemsModule {}
