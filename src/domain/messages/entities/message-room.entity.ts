import { User } from '@/domain/users/entities/user.entity';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity({ name: 'message_rooms' })
export class MessageRoom {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne('User', 'messageRooms')
  @JoinColumn({ name: 'first_user_id' })
  firstUser: User;

  @ManyToOne('User', 'messageRooms')
  @JoinColumn({ name: 'second_user_id' })
  secondUser: User;

  @OneToMany('Message', 'messageRoom', {
    cascade: true,
  })
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
