import { Module } from '@nestjs/common';
import { PollItemsService } from './pollItems.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollItem } from './entities/pollItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PollItem])],
  exports: [PollItemsService],
  providers: [PollItemsService],
})
export class PollItemsModule {}
