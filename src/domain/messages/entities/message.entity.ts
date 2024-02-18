import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageRoom } from './message-room.entity';
import { User } from '@/domain/users/entities/user.entity';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne('MessageRoom', 'messages', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_rooms_id' })
  messageRoom: MessageRoom;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'first_user_id' })
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'second_user_id' })
  receiver: User;

  @Column()
  content: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
