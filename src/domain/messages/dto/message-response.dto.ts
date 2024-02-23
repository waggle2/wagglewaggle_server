import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MessageRoom } from '../entities/message-room.entity';
import { UserProfileDto } from '@/domain/users/dto/user-profile.dto';
import { Message } from '../entities/message.entity';

export class MessageResponseDto {
  @ApiProperty({ type: Number, description: '메세지 ID' })
  @Expose()
  readonly id: number;

  @ApiProperty({ type: MessageRoom, description: '채팅방 ID' })
  @Expose()
  readonly messageRoom: MessageRoom;

  @ApiProperty({ type: UserProfileDto, description: '발신자' })
  @Expose()
  readonly sender: UserProfileDto;

  @ApiProperty({ type: UserProfileDto, description: '수신자' })
  @Expose()
  readonly receiver: UserProfileDto;

  @ApiProperty({ type: String, description: '메세지 내용' })
  @Expose()
  readonly content: string;

  @ApiProperty({ type: Boolean, description: '수신자 읽음 여부' })
  @Expose()
  readonly isRead: boolean;

  @ApiProperty({ type: Date, description: '보낸 날짜, 시간' })
  @Expose()
  readonly createdAt: Date;

  constructor(message: Message) {
    this.id = message.id;
    this.messageRoom = message.messageRoom;
    this.sender = new UserProfileDto(message.sender);
    this.receiver = new UserProfileDto(message.receiver);
    this.content = message.content;
    this.isRead = message.isRead;
    this.createdAt = message.createdAt;
  }
}
