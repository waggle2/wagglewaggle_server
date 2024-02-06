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

  @Column({ name: 'post_id' })
  postId: number;

  @Column({ name: 'comment_id' })
  commentId: number;

  @Column()
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
