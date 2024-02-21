import { NotificationType } from '@/@types/enum/notification-type.enum';
import { IsEnum, IsString } from 'class-validator';

export class SendNotificationDto {
  @IsEnum(NotificationType)
  readonly type: NotificationType;

  @IsString()
  readonly message: string;

  @IsString()
  readonly subscriberNickname: string;
}
