import { NotificationType } from '@/@types/enum/notification-type.enum';
import { IsEnum, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  readonly type: NotificationType;

  @IsString()
  readonly message: string;
}
