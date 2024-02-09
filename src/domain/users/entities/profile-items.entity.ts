import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Animal } from '@/@types/enum/animal.enum';
import { User } from './user.entity';
import { Item } from '@/domain/items/entities/item.entity';

@Entity({ name: 'profile_items' })
export class ProfileItems {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne('User', 'profileItems', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: Animal })
  animal: Animal;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'emoji_id' })
  emoji: Item;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'background_id' })
  background: Item;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'frame_id' })
  frame: Item;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'wallpaper_id' })
  wallpaper: Item;
}
