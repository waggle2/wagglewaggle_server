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
import { Length } from 'class-validator';

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

  @Column()
  @Length(1, 150, { message: '1~150자 사이의 내용을 입력해주세요' })
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
