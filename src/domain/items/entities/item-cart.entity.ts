import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/domain/users/entities/user.entity';

@Entity({ name: 'item_cart' })
export class ItemCart {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne('User', 'itemCart', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'simple-array', nullable: true })
  items: number[];

  @Column({ name: 'total_points', type: 'int', default: 0 })
  totalPoints: number;
}
