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
import { AuthenticationProvider, State } from '@/domain/types/enum/user.enum';
import { Animal } from '@/domain/types/enum/animal.enum';
import { Credential } from './credential.entity';
import { Post } from '@/domain/posts/entities/post.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'json' })
  points: number;

  @Column({ name: 'primary_animal', type: 'enum', enum: Animal })
  primaryAnimal: Animal;

  @Column({ name: 'second_animal', type: 'enum', enum: Animal })
  secondAnimal: Animal;

  @OneToMany('Post', 'user')
  posts: Post[];

  // @OneToMany(() => Comment, (comment) => comment.user)
  // comments: Comment[];

  // @OneToMany(() => Message, (message) => message.user)
  // messages: Message[];

  // @OneToMany(() => Item, (item) => item.user)
  // items: Item[];

  // @OneToMany(() => Sticker, (sticker) => sticker.user)
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
