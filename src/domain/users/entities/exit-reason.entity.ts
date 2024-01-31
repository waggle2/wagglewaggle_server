import { ExitReasonEnum } from '@/domain/types/enum/user.enum';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'exit_reasons' })
export class ExitReason {
  @Column()
  userId: number;

  @Column({ type: 'enum', enum: ExitReasonEnum })
  reason: ExitReasonEnum;

  @Column({ type: 'text', nullable: true })
  otherReasons: string; // Only applicable if reason is 'OTHER'
}
