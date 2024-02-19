import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('feedbacks')
export class Feedback {
  @ApiProperty({
    description: '피드백 ID',
    type: Number,
  })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    description: '답변 받을 이메일',
    type: String,
  })
  @Column({ nullable: false })
  email: string;

  @ApiProperty({
    description: '피드백 제목',
    type: String,
  })
  @Column({ nullable: false })
  title: string;

  @ApiProperty({
    description: '피드백 내용',
    type: String,
  })
  @Column({ nullable: false })
  content: string;

  @ApiProperty({
    description: '유저 ID',
    type: String,
  })
  @Column({ nullable: false })
  userId: string;

  @ApiProperty({
    description: '처리 여부',
    type: Boolean,
  })
  @Column({ name: 'resolved', default: false })
  resolved: boolean;

  @ApiProperty({
    description: '생성일자',
    type: Date,
  })
  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
