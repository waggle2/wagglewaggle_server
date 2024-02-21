import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAuthority } from './user-authority.entity';
import { AuthenticationProvider, State } from '@/@types/enum/user.enum';
import { Animal } from '@/@types/enum/animal.enum';
import { Credential } from './credential.entity';
import { Post } from '@/domain/posts/entities/post.entity';
import { ItemCart } from '@/domain/items/entities/item-cart.entity';
import { ProfileItems } from './profile-items.entity';
import { MessageRoom } from '@/domain/messages/entities/message-room.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'authentication_provider',
    type: 'enum',
    enum: AuthenticationProvider,
  })
  authenticationProvider: AuthenticationProvider;

  @Column({ name: 'social_id', unique: true, nullable: true })
  socialId: string | null;

  @OneToOne('Credential', 'user', { cascade: true })
  credential: Credential;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @OneToMany('UserAuthority', 'user', {
    cascade: true,
  })
  authorities: UserAuthority[];

  @Column({ type: 'enum', enum: State, default: State.JOINED })
  state: State;

  @Column({ name: 'primary_animal', type: 'enum', enum: Animal })
  primaryAnimal: Animal;

  @Column({ name: 'second_animal', type: 'enum', enum: Animal, nullable: true })
  secondAnimal: Animal;

  @Column({ name: 'profile_animal', type: 'enum', enum: Animal })
  profileAnimal: Animal;

  @Column({ default: 0 })
  catCoins: number;

  @Column({ default: 0 })
  bearCoins: number;

  @Column({ default: 0 })
  dogCoins: number;

  @Column({ default: 0 })
  foxCoins: number;

  @Column({ name: 'current_refresh_token', nullable: true })
  currentRefreshToken: string;

  @Column({ name: 'is_subscribed', default: false })
  isSubscribed: boolean;

  @OneToMany('Post', 'author')
  posts: Post[];

  @OneToMany('Comment', 'author')
  comments: Comment[];

  @OneToMany('MessageRoom', 'user')
  messageRooms: MessageRoom[];

  @OneToMany('ProfileItems', 'user', {
    cascade: true,
    nullable: true,
  })
  profileItems: ProfileItems[]; // 착용한 아이템

  @Column({ type: 'simple-array', nullable: true })
  items: number[]; // 갖고 있는 아이템

  @OneToMany('ItemCart', 'user', { cascade: true })
  itemCart: ItemCart[];

  // @OneToMany(() => Sticker, (stickers) => stickers.user)
  // givenStickers: Sticker[];

  // @Column({
  //   type: 'json',
  //   default: { bear: 0, fox: 0, dog: 0, cat: 0 },
  //   name: 'received_stickers',
  // })
  // receivedStickers: { bear: number; fox: number; dog: number; cat: number }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
