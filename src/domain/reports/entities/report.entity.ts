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

  @ManyToOne('User', 'reports')
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ name: 'post_id', nullable: true })
  postId: number | null;

  @Column({ name: 'comment_id', nullable: true })
  commentId: number | null;

  @Column()
  content: string;

  @Column({
    name: 'reason',
    type: 'enum',
    enum: ReportReason,
  })
  reason: ReportReason;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
