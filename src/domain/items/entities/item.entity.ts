import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Animal } from '@/domain/types/enum/animal.enum';
import { Type } from '@/domain/types/enum/item-type.enum';

@Entity({ name: 'items' })
export class Item {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enum: Animal })
  animal: Animal;

  @Column({ type: 'enum', enum: Type })
  type: Type;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column({ name: 'purchased_count' })
  purchasedCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
