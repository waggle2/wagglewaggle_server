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
// import { Post } from 'src/posts/entities/post.entity';
import { AuthenticationProvider, State } from '@/domain/types/enum/users.enum';
import { Animal } from '@/domain/types/enum/animal.enum';
import { Credential } from './credential.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'authentication_provider',
    type: 'enum',
    enum: AuthenticationProvider,
  })
  authenticationProvider: AuthenticationProvider;

  @OneToOne('Credential', 'user', { cascade: true })
  credential: Credential;

  @OneToMany('UserAuthority', 'user', {
    cascade: true,
  })
  authorities: UserAuthority[];

  @Column({ type: 'enum', enum: State })
  state: State;

  @Column()
  points: number;

  @Column({ name: 'primary_animal', type: 'enum', enum: Animal })
  primaryAnimal: Animal;

  @Column({ name: 'second_animal', type: 'enum', enum: Animal })
  secondAnimal: Animal;

  // @OneToMany(() => Post, (post) => post.user)
  // posts: Post[];

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
