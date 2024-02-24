import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../users/entities/user.entity';
import { MessageRoom } from './entities/message-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { UsersService } from '../users/users.service';
import {
  MessageBadRequestException,
  MessageNotFoundException,
  MessageRoomNotFoundException,
} from './exceptions/message.exception';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageRoom)
    private readonly messageRoomRepository: Repository<MessageRoom>,
    private readonly usersService: UsersService,
  ) {}

  // 쪽지 보내기 (채팅방 없을 시 채팅방 생성)
  async sendMessage(
    createMessageDto: CreateMessageDto,
    user: User,
  ): Promise<MessageRoom> {
    if (!createMessageDto.content || createMessageDto.content.trim() === '') {
      throw new MessageBadRequestException('쪽지 내용을 제공해야 합니다.');
    }

    const messageRoom = await this.findOrCreateMessageRoom(
      createMessageDto,
      user,
    );

    const message = this.messageRepository.create({
      messageRoom: { id: messageRoom.id },
      sender: { id: user.id },
      receiver: { id: createMessageDto.receiver },
      content: createMessageDto.content,
    });

    await this.messageRepository.save(message);

    await this.messageRoomRepository.update(messageRoom.id, {
      updatedAt: new Date(),
    });

    return await this.getRoom(messageRoom.id, user);
  }

  // 채팅방 찾기, 없으면 채팅방 생성
  private async findOrCreateMessageRoom(
    createMessageDto: CreateMessageDto,
    user: User,
  ): Promise<MessageRoom> {
    const sender = await this.usersService.findById(user.id);
    const receiver = await this.usersService.findById(
      createMessageDto.receiver,
    );

    let messageRoom = await this.messageRoomRepository
      .createQueryBuilder('messageRoom')
      .leftJoinAndSelect('messageRoom.firstUser', 'firstUser')
      .leftJoinAndSelect('messageRoom.secondUser', 'secondUser')
      .where(
        '(firstUser.id = :senderId AND secondUser.id = :receiverId) OR (firstUser.id = :receiverId AND secondUser.id = :senderId)',
        {
          senderId: sender.id,
          receiverId: receiver.id,
        },
      )
      .getOne();

    if (!messageRoom) {
      messageRoom = this.messageRoomRepository.create({
        firstUser: { id: sender.id },
        secondUser: { id: receiver.id },
        messages: [],
      });
      await this.messageRoomRepository.save(messageRoom);
    }

    return messageRoom;
  }

  // 채팅방 리스트 조회
  async getRooms(user: User): Promise<MessageRoom[]> {
    const rooms = await this.messageRoomRepository
      .createQueryBuilder('messageRoom')
      .leftJoinAndSelect('messageRoom.firstUser', 'firstUser')
      .leftJoinAndSelect('firstUser.credential', 'firstUser_credential')
      .leftJoinAndSelect('firstUser.profileItems', 'firstUser_profileItems')
      .leftJoinAndSelect('firstUser_profileItems.emoji', 'firstUser_emoji')
      .leftJoinAndSelect(
        'firstUser_profileItems.wallpaper',
        'firstUser_wallpaper',
      )
      .leftJoinAndSelect(
        'firstUser_profileItems.background',
        'firstUser_background',
      )
      .leftJoinAndSelect('firstUser_profileItems.frame', 'firstUser_frame')
      .leftJoinAndSelect('messageRoom.secondUser', 'secondUser')
      .leftJoinAndSelect('secondUser.credential', 'secondUser_credential')
      .leftJoinAndSelect('secondUser.profileItems', 'secondUser_profileItems')
      .leftJoinAndSelect('secondUser_profileItems.emoji', 'secondUser_emoji')
      .leftJoinAndSelect(
        'secondUser_profileItems.wallpaper',
        'secondUser_wallpaper',
      )
      .leftJoinAndSelect(
        'secondUser_profileItems.background',
        'secondUser_background',
      )
      .leftJoinAndSelect('secondUser_profileItems.frame', 'secondUser_frame')
      .leftJoinAndSelect('messageRoom.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender')
      .leftJoinAndSelect('messages.receiver', 'receiver')
      .leftJoinAndSelect('sender.credential', 'sender_credential')
      .leftJoinAndSelect('sender.profileItems', 'sender_profileItems')
      .leftJoinAndSelect('sender_profileItems.emoji', 'sender_emoji')
      .leftJoinAndSelect('sender_profileItems.wallpaper', 'sender_wallpaper')
      .leftJoinAndSelect('sender_profileItems.background', 'sender_background')
      .leftJoinAndSelect('sender_profileItems.frame', 'sender_frame')
      .leftJoinAndSelect('receiver.credential', 'receiver_credential')
      .leftJoinAndSelect('receiver.profileItems', 'receiver_profileItems')
      .leftJoinAndSelect('receiver_profileItems.emoji', 'receiver_emoji')
      .leftJoinAndSelect(
        'receiver_profileItems.wallpaper',
        'receiver_wallpaper',
      )
      .leftJoinAndSelect(
        'receiver_profileItems.background',
        'receiver_background',
      )
      .leftJoinAndSelect('receiver_profileItems.frame', 'receiver_frame')
      .where('firstUser.id = :userId OR secondUser.id = :userId', {
        userId: user.id,
      })
      .andWhere('messageRoom.deletedAt IS NULL')
      .orderBy('messageRoom.updatedAt', 'DESC')
      .getMany();

    rooms.forEach((room) => {
      const messagesLength = room.messages.length;
      if (messagesLength > 0) {
        room['lastMessage'] = room.messages[messagesLength - 1].content;
      } else {
        room['lastMessage'] = null;
      }

      const unreadMessageCount = room.messages.filter(
        (message) =>
          message.sender.id !== user.id &&
          message.receiver.id === user.id &&
          !message.isRead,
      ).length;

      room['unreadMessageCount'] = unreadMessageCount;
    });

    return rooms;
  }

  // 채팅방 조회
  async getRoom(id: number, user: User): Promise<MessageRoom> {
    const messageRoom = await this.messageRoomRepository
      .createQueryBuilder('messageRoom')
      .leftJoinAndSelect('messageRoom.firstUser', 'firstUser')
      .leftJoinAndSelect('firstUser.credential', 'firstUser_credential')
      .leftJoinAndSelect('firstUser.profileItems', 'firstUser_profileItems')
      .leftJoinAndSelect('firstUser_profileItems.emoji', 'firstUser_emoji')
      .leftJoinAndSelect(
        'firstUser_profileItems.wallpaper',
        'firstUser_wallpaper',
      )
      .leftJoinAndSelect(
        'firstUser_profileItems.background',
        'firstUser_background',
      )
      .leftJoinAndSelect('firstUser_profileItems.frame', 'firstUser_frame')
      .leftJoinAndSelect('messageRoom.secondUser', 'secondUser')
      .leftJoinAndSelect('secondUser.credential', 'secondUser_credential')
      .leftJoinAndSelect('secondUser.profileItems', 'secondUser_profileItems')
      .leftJoinAndSelect('secondUser_profileItems.emoji', 'secondUser_emoji')
      .leftJoinAndSelect(
        'secondUser_profileItems.wallpaper',
        'secondUser_wallpaper',
      )
      .leftJoinAndSelect(
        'secondUser_profileItems.background',
        'secondUser_background',
      )
      .leftJoinAndSelect('secondUser_profileItems.frame', 'secondUser_frame')
      .leftJoinAndSelect('messageRoom.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender')
      .leftJoinAndSelect('messages.receiver', 'receiver')
      .leftJoinAndSelect('sender.credential', 'sender_credential')
      .leftJoinAndSelect('sender.profileItems', 'sender_profileItems')
      .leftJoinAndSelect('sender_profileItems.emoji', 'sender_emoji')
      .leftJoinAndSelect('sender_profileItems.wallpaper', 'sender_wallpaper')
      .leftJoinAndSelect('sender_profileItems.background', 'sender_background')
      .leftJoinAndSelect('sender_profileItems.frame', 'sender_frame')
      .leftJoinAndSelect('receiver.credential', 'receiver_credential')
      .leftJoinAndSelect('receiver.profileItems', 'receiver_profileItems')
      .leftJoinAndSelect('receiver_profileItems.emoji', 'receiver_emoji')
      .leftJoinAndSelect(
        'receiver_profileItems.wallpaper',
        'receiver_wallpaper',
      )
      .leftJoinAndSelect(
        'receiver_profileItems.background',
        'receiver_background',
      )
      .leftJoinAndSelect('receiver_profileItems.frame', 'receiver_frame')
      .where('messageRoom.id = :id', { id })
      .orderBy('messages.createdAt', 'ASC')
      .getOne();
    if (!messageRoom) {
      throw new MessageRoomNotFoundException('채팅방을 찾을 수 없습니다.');
    }
    if (
      messageRoom.firstUser.id !== user.id &&
      messageRoom.secondUser.id !== user.id
    ) {
      throw new MessageBadRequestException('유저가 속한 채팅방이 아닙니다.');
    }

    return messageRoom;
  }

  // 읽음 표시
  async markMessagesAsRead(
    messageRoom: MessageRoom,
    user: User,
  ): Promise<void> {
    const promises = [];
    if (messageRoom.messages) {
      messageRoom.messages.forEach(async (message) => {
        if (
          message &&
          message.sender &&
          message.sender.id !== user.id &&
          message.receiver.id === user.id &&
          !message.isRead
        ) {
          message.isRead = true;
          promises.push(this.messageRepository.save(message));
        }
      });
    } else {
      throw new MessageNotFoundException('채팅방의 메세지를 찾을 수 없습니다.');
    }

    await Promise.all(promises);
  }

  // 채팅방 나가기
  async leaveRoom(id: number, user: User): Promise<void> {
    const messageRoom = await this.getRoom(id, user);

    if (!messageRoom.leaveRoom) {
      messageRoom.leaveRoom = [user.id];
    } else {
      messageRoom.leaveRoom.push(user.id);
    }
    await this.messageRoomRepository.save(messageRoom);

    if (messageRoom.leaveRoom.length === 2) {
      await this.messageRoomRepository.softDelete(id);
    }
  }
}
