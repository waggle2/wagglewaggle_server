import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
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
  @Column({ nullable: false })
  keyword: string;

  @ApiProperty({
    description: '유저 아이디',
    type: String,
  })
  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ApiProperty({
    description: '검색 히스토리 생성일자',
    type: Date,
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
