import { ExitReasonEnum } from '@/@types/enum/user.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'exit_reasons' })
export class ExitReason {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: ExitReasonEnum })
  reason: ExitReasonEnum;

  @Column({ type: 'text', nullable: true })
  otherReasons: string; // Only applicable if reason is 'OTHER'
}
