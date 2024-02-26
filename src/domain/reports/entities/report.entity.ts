import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/domain/users/entities/user.entity';
import { ReportReason } from '@/@types/enum/report-reason.enum';

@Entity({ name: 'reports' })
export class Report {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne('User', 'reports', {
    nullable: false,
  })
  @JoinColumn({ name: 'reporter_id', referencedColumnName: 'id' })
  reporter: User;

  @Column({ name: 'post_id', nullable: true })
  postId: number;

  @Column({ name: 'comment_id', nullable: true })
  commentId: number;

  @Column({ name: 'message_room_id', nullable: true })
  messageRoomId: number;

  @Column({ type: 'varchar', length: 300, nullable: false })
  content: string;

  @Column({
    name: 'reason',
    type: 'enum',
    enum: ReportReason,
    nullable: false,
  })
  reason: ReportReason;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
