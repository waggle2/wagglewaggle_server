import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('search_histories')
export class SearchHistory {
  @ApiProperty({
    description: '검색 히스토리 아이디',
    type: Number,
  })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    description: '검색 키워드',
    type: String,
  })
  @Column({ nullable: false, unique: true })
  keyword: string;

  @ApiProperty({
    description: '유저 아이디',
    type: String,
  })
  @Index()
  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ApiProperty({
    description: '검색 히스토리 생성일자',
    type: Date,
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: '검색 최신일자',
    type: Date,
  })
  @Index()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
