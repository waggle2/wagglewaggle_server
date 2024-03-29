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
import { UserBlockForbiddenException } from '../authentication/exceptions/authentication.exception';

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

    const blockedUsers = user.usersBlockedByThisUser;
    const blockedBy = user.usersBlockingThisUser;
    if (blockedUsers.includes(createMessageDto.receiver)) {
      throw new UserBlockForbiddenException(
        '차단한 유저에게 쪽지를 보낼 수 없습니다.',
      );
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
    if (blockedBy.includes(createMessageDto.receiver)) {
      message.leaveRoom = [createMessageDto.receiver];
    }
    await this.messageRepository.save(message);

    if (messageRoom.leaveRoom) {
      if (messageRoom.leaveRoom.includes(createMessageDto.receiver)) {
        messageRoom.leaveRoom = messageRoom.leaveRoom.filter(
          (userId) => userId !== createMessageDto.receiver,
        );
        await this.messageRoomRepository.save(messageRoom);
      }
    }

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

  // 공통 함수: 채팅방 쿼리 빌더 생성
  private async createMessageRoomQueryBuilder() {
    return this.messageRoomRepository
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
      .withDeleted()
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
      .withDeleted()
      .leftJoinAndSelect('messageRoom.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender')
      .withDeleted()
      .leftJoinAndSelect('messages.receiver', 'receiver')
      .withDeleted();
  }

  // 채팅방 리스트 조회
  async getRooms(user: User): Promise<MessageRoom[]> {
    const queryBuilder = await this.createMessageRoomQueryBuilder();
    const rooms = await queryBuilder
      .where('firstUser.id = :userId OR secondUser.id = :userId', {
        userId: user.id,
      })
      .andWhere('messageRoom.deletedAt IS NULL')
      .orderBy('messageRoom.updatedAt', 'DESC')
      .getMany();

    const filteredRooms = rooms.filter(
      (room) => !room.leaveRoom || !room.leaveRoom.includes(user.id),
    );

    filteredRooms.forEach((room) => {
      room.messages = room.messages.filter(
        (message) => !message.leaveRoom || !message.leaveRoom.includes(user.id),
      );

      const messagesLength = room.messages.length;
      if (messagesLength > 0) {
        const lastMessage = room.messages[messagesLength - 1];
        room['lastMessage'] = {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
        };
      } else {
        room['lastMessage'] = null;
      }

      room['unreadMessageCount'] = room.messages.filter(
        (message) =>
          message.sender.id !== user.id &&
          message.receiver.id === user.id &&
          !message.isRead,
      ).length;
    });

    return filteredRooms;
  }

  // 채팅방 조회
  async getRoom(id: number, user: User): Promise<MessageRoom> {
    const queryBuilder = await this.createMessageRoomQueryBuilder();
    const messageRoom = await queryBuilder
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
    if (messageRoom.leaveRoom && messageRoom.leaveRoom.includes(user.id)) {
      throw new MessageBadRequestException('이미 나간 채팅방입니다.');
    }

    const blockedUsers = user.usersBlockedByThisUser;

    messageRoom['isBlockedUser'] =
      blockedUsers.includes(messageRoom.firstUser.id) ||
      blockedUsers.includes(messageRoom.secondUser.id);

    return messageRoom;
  }

  // 읽음 표시
  async markMessagesAsRead(
    messageRoom: MessageRoom,
    user: User,
  ): Promise<void> {
    const promises = [];
    if (messageRoom.messages) {
      for (const message of messageRoom.messages) {
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
      }
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
    } else if (messageRoom.leaveRoom.includes(user.id)) {
      throw new MessageBadRequestException('이미 나간 채팅방입니다.');
    } else {
      messageRoom.leaveRoom.push(user.id);
    }
    await this.messageRoomRepository.save(messageRoom);

    if (messageRoom.messages) {
      await Promise.all(
        messageRoom.messages.map(async (message) => {
          if (!message.leaveRoom) {
            message.leaveRoom = [user.id];
          } else if (!message.leaveRoom.includes(user.id)) {
            message.leaveRoom.push(user.id);
          }
          await this.messageRepository.save(message);

          if (message.leaveRoom.length === 2) {
            await this.messageRepository.delete(message.id);
          }
        }),
      );
    }

    if (messageRoom.leaveRoom.length === 2) {
      await this.messageRoomRepository.softDelete(id);
    }
  }

  async findMessage(id: number): Promise<Message> {
    const message = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .withDeleted()
      .leftJoinAndSelect('message.receiver', 'receiver')
      .withDeleted()
      .where('message.id = :id', { id })
      .getOne();
    if (!message) {
      throw new MessageNotFoundException('해당 메세지를 찾을 수 없습니다.');
    }
    return message;
  }
}
