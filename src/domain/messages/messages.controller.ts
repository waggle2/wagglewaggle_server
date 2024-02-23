import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '../authentication/guards/jwt-authentication.guard';
import { HttpResponse } from '@/@types/http-response';
import RequestWithUser from '../authentication/interfaces/request-with-user.interface';
import { MessageResponseDto } from './dto/message-response.dto';
import { UserProfileDto } from '../users/dto/user-profile.dto';

@Controller('messages')
@ApiTags('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '쪽지 보내기 (채팅방 없을 시 채팅방 생성)' })
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: RequestWithUser,
  ) {
    const messageRoom = await this.messagesService.sendMessage(
      createMessageDto,
      req.user,
    );
    await this.messagesService.markMessagesAsRead(messageRoom, req.user);
    const transformedFirstUser = new UserProfileDto(messageRoom.firstUser);
    const transformedSecondUser = new UserProfileDto(messageRoom.secondUser);
    const transformedMessages = messageRoom.messages.map(
      (message) => new MessageResponseDto(message),
    );
    return HttpResponse.created('쪽지가 전송되었습니다.', {
      ...messageRoom,
      firstUser: transformedFirstUser,
      secondUser: transformedSecondUser,
      messages: transformedMessages,
    });
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '채팅방 리스트 조회' })
  async getRooms(@Req() req: RequestWithUser) {
    const rooms = await this.messagesService.getRooms(req.user);
    const transformedRooms = rooms.map((room) => {
      const transformedFirstUser = new UserProfileDto(room.firstUser);
      const transformedSecondUser = new UserProfileDto(room.secondUser);
      const transformedMessages = room.messages.map(
        (message) => new MessageResponseDto(message),
      );
      return {
        ...room,
        firstUser: transformedFirstUser,
        secondUser: transformedSecondUser,
        messages: transformedMessages,
      };
    });
    return HttpResponse.success(
      '채팅방 리스트가 조회되었습니다.',
      transformedRooms,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '채팅방 조회' })
  async getRoom(@Param('id') id: string, @Req() req: RequestWithUser) {
    const messageRoom = await this.messagesService.getRoom(+id, req.user);
    await this.messagesService.markMessagesAsRead(messageRoom, req.user);
    const transformedFirstUser = new UserProfileDto(messageRoom.firstUser);
    const transformedSecondUser = new UserProfileDto(messageRoom.secondUser);
    const transformedMessages = messageRoom.messages.map(
      (message) => new MessageResponseDto(message),
    );
    return HttpResponse.success('채팅방이 조회되었습니다.', {
      ...messageRoom,
      firstUser: transformedFirstUser,
      secondUser: transformedSecondUser,
      messages: transformedMessages,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '채팅방 나가기' })
  async leaveRoom(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.messagesService.leaveRoom(+id, req.user);
    return HttpResponse.success('채팅방을 나갔습니다.');
  }
}
