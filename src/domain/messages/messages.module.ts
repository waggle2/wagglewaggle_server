import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageRoom } from './entities/message-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessageRoom])],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
