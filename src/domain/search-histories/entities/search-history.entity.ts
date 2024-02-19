import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('search_histories')
export class SearchHistory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  keyword: string;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
