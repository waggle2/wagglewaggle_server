import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_stickers' })
export class UserStickers {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne('User', 'userStickers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 0 })
  bearStickers: number;

  @Column({ default: 0 })
  foxStickers: number;

  @Column({ default: 0 })
  dogStickers: number;

  @Column({ default: 0 })
  catStickers: number;

  @Column({ default: 0 })
  bearStickerCount: number;

  @Column({ default: 0 })
  foxStickerCount: number;

  @Column({ default: 0 })
  dogStickerCount: number;

  @Column({ default: 0 })
  catStickerCount: number;
}
