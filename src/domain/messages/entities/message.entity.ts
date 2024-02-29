import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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
  @JoinColumn({ name: 'message_room_id' })
  messageRoom: MessageRoom;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ type: 'simple-array', nullable: true })
  leaveRoom: string[];

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}
