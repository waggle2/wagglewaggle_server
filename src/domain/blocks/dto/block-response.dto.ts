import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BlockUser } from '../entities/block.entity';

export class BlockResponseDto {
  @ApiProperty({ type: Number, description: '차단 ID' })
  @Expose()
  readonly id: number;

  @ApiProperty({ type: Object, description: '차단한 유저 정보(id, nickname)' })
  @Expose()
  readonly blockedBy: { id: string; nickname: string };

  @ApiProperty({ type: Object, description: '차단된 유저 정보(id, nickname)' })
  @Expose()
  readonly blockedUser: { id: string; nickname: string };

  @ApiProperty({ type: Date, description: '차단 날짜, 시간' })
  @Expose()
  readonly createdAt: Date;

  constructor(blockUser: BlockUser) {
    this.id = blockUser.id;
    this.blockedBy = {
      id: blockUser.blockedBy?.id,
      nickname: blockUser.blockedBy?.credential.nickname,
    };
    this.blockedUser = {
      id: blockUser.blockedUser?.id,
      nickname: blockUser.blockedUser?.credential.nickname,
    };
    this.createdAt = blockUser.createdAt;
  }
}
