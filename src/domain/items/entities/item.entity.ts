import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Animal } from '@/@types/enum/animal.enum';
import { ItemType } from '@/@types/enum/item-type.enum';

@Entity({ name: 'items' })
export class Item {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enum: Animal })
  animal: Animal;

  @Column({ name: 'item_type', type: 'enum', enum: ItemType })
  itemType: ItemType;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column({ name: 'purchased_count', type: 'int', default: 0 })
  purchasedCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
