import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '@/notification/entities/notification.entity';
import { User } from '@/domain/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  exports: [NotificationService],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
