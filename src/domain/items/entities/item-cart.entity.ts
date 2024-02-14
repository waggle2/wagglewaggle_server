import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/domain/users/entities/user.entity';
import { Animal } from '@/@types/enum/animal.enum';

@Entity({ name: 'item_cart' })
export class ItemCart {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne('User', 'itemCart', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: Animal })
  animal: Animal;

  @Column({ type: 'simple-array', nullable: true })
  items: number[];

  @Column({ name: 'total_points', type: 'int', default: 0 })
  totalCoins: number;
}
