import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationType } from '@/@types/enum/notification-type.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enum: NotificationType, nullable: false })
  type: NotificationType;

  @Column({ nullable: false })
  message: string;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
