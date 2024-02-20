import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from '@/notification/dto/create-notification.dto';
import { SendNotificationDto } from '@/notification/dto/send-notification.dto';
import { Notification } from '@/notification/entities/notification.entity';

@Injectable()
export class NotificationService {
  private userNotifications = new Map<string, Subject<any>>();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  private getUserSubject(userId: string) {
    if (!this.userNotifications.has(userId)) {
      this.userNotifications.set(userId, new Subject<any>());
    }
    return this.userNotifications.get(userId);
  }

  async getNotificationForUser(userId: string) {
    return this.getUserSubject(userId).asObservable();
  }

  async sendNotificationToUser(userId: string, data: SendNotificationDto) {
    this.getUserSubject(userId).next(data);
  }

  async createNotification(
    userId: string,
    createNotificationDto: CreateNotificationDto,
  ) {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      userId,
    });
    return await this.notificationRepository.save(notification);
  }
}
