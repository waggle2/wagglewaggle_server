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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiResponse({
    status: 200,
    description:
      '쪽지 전송 성공 (messages의 sender, receiver는 firstUser 형식과 동일)',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '쪽지가 전송되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            leaveRoom: {
              type: 'array',
              items: { type: 'string' },
              nullable: true,
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
            firstUser: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '77e88f4b-5ff5-47f9-9b3b-b1757c491cbb',
                },
                nickname: { type: 'string', example: '은리닉네임' },
                profileAnimal: { type: 'string', example: '곰돌이' },
                profileItems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      animal: { type: 'string', example: '곰돌이' },
                      emoji: {
                        type: 'object',
                        properties: {
                          id: { type: 'number', example: 6 },
                          animal: { type: 'string', example: '곰돌이' },
                          itemType: { type: 'string', example: 'emoji' },
                          name: { type: 'string', example: 'ㅏ아아' },
                          price: { type: 'number', example: 100 },
                          image: { type: 'string', example: '' },
                          purchasedCount: { type: 'number', example: 1 },
                          createdAt: {
                            type: 'string',
                            example: '2024-02-21T07:12:35.837Z',
                          },
                          updatedAt: {
                            type: 'string',
                            example: '2024-02-21T07:14:50.000Z',
                          },
                          deletedAt: {
                            type: 'string',
                            example: null,
                          },
                        },
                      },
                      wallpaper: { type: 'object', properties: {} },
                      background: { type: 'object', properties: {} },
                      frame: { type: 'object', properties: {} },
                    },
                  },
                },
              },
            },
            secondUser: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '77e88f4b-5ff5-47f9-9b3b-b1757c491cbb',
                },
                nickname: { type: 'string', example: '은리닉네임' },
                profileAnimal: { type: 'string', example: '곰돌이' },
                profileItems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      animal: { type: 'string', example: '곰돌이' },
                      emoji: {
                        type: 'object',
                        properties: {
                          id: { type: 'number', example: 6 },
                          animal: { type: 'string', example: '곰돌이' },
                          itemType: { type: 'string', example: 'emoji' },
                          name: { type: 'string', example: 'ㅏ아아' },
                          price: { type: 'number', example: 100 },
                          image: { type: 'string', example: '' },
                          purchasedCount: { type: 'number', example: 1 },
                          createdAt: {
                            type: 'string',
                            example: '2024-02-21T07:12:35.837Z',
                          },
                          updatedAt: {
                            type: 'string',
                            example: '2024-02-21T07:14:50.000Z',
                          },
                          deletedAt: {
                            type: 'string',
                            example: null,
                          },
                        },
                      },
                      wallpaper: { type: 'object', properties: {} },
                      background: { type: 'object', properties: {} },
                      frame: { type: 'object', properties: {} },
                    },
                  },
                },
              },
            },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 33 },
                  sender: { type: 'object', properties: {} },
                  receiver: { type: 'object', properties: {} },
                  content: { type: 'string', example: '안녕하세요' },
                  isRead: { type: 'boolean', example: false },
                  createdAt: {
                    type: 'string',
                    example: '2024-02-23T16:18:23.621Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '쪽지 내용을 제공해야 합니다.',
  })
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
  @ApiResponse({
    status: 200,
    description: '채팅방 리스트가 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '채팅방 리스트가 조회되었습니다.',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              leaveRoom: {
                type: 'array',
                items: { type: 'string' },
                nullable: true,
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
              },
              firstUser: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '77e88f4b-5ff5-47f9-9b3b-b1757c491cbb',
                  },
                  nickname: { type: 'string', example: '은리닉네임' },
                  profileAnimal: { type: 'string', example: '곰돌이' },
                  profileItems: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 1 },
                        animal: { type: 'string', example: '곰돌이' },
                        emoji: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 6 },
                            animal: { type: 'string', example: '곰돌이' },
                            itemType: { type: 'string', example: 'emoji' },
                            name: { type: 'string', example: 'ㅏ아아' },
                            price: { type: 'number', example: 100 },
                            image: { type: 'string', example: '' },
                            purchasedCount: { type: 'number', example: 1 },
                            createdAt: {
                              type: 'string',
                              example: '2024-02-21T07:12:35.837Z',
                            },
                            updatedAt: {
                              type: 'string',
                              example: '2024-02-21T07:14:50.000Z',
                            },
                            deletedAt: {
                              type: 'string',
                              example: null,
                            },
                          },
                        },
                        wallpaper: { type: 'object', properties: {} },
                        background: { type: 'object', properties: {} },
                        frame: { type: 'object', properties: {} },
                      },
                    },
                  },
                },
              },
              secondUser: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '77e88f4b-5ff5-47f9-9b3b-b1757c491cbb',
                  },
                  nickname: { type: 'string', example: '은리닉네임' },
                  profileAnimal: { type: 'string', example: '곰돌이' },
                  profileItems: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 1 },
                        animal: { type: 'string', example: '곰돌이' },
                        emoji: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 6 },
                            animal: { type: 'string', example: '곰돌이' },
                            itemType: { type: 'string', example: 'emoji' },
                            name: { type: 'string', example: 'ㅏ아아' },
                            price: { type: 'number', example: 100 },
                            image: { type: 'string', example: '' },
                            purchasedCount: { type: 'number', example: 1 },
                            createdAt: {
                              type: 'string',
                              example: '2024-02-21T07:12:35.837Z',
                            },
                            updatedAt: {
                              type: 'string',
                              example: '2024-02-21T07:14:50.000Z',
                            },
                            deletedAt: {
                              type: 'string',
                              example: null,
                            },
                          },
                        },
                        wallpaper: { type: 'object', properties: {} },
                        background: { type: 'object', properties: {} },
                        frame: { type: 'object', properties: {} },
                      },
                    },
                  },
                },
              },
              messages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 33 },
                    sender: { type: 'string', example: '발신자 id' },
                    receiver: { type: 'string', example: '수신자 id' },
                    content: { type: 'string', example: '안녕하세요' },
                    isRead: { type: 'boolean', example: false },
                    createdAt: {
                      type: 'string',
                      example: '2024-02-23T16:18:23.621Z',
                    },
                  },
                },
              },
              lastMessage: {
                type: 'object',
                properties: {
                  content: { type: 'string', example: '안녕하세요' },
                  createdAt: {
                    type: 'string',
                    example: '2024-02-23T16:18:23.621Z',
                  },
                },
              },
              unreadMessageCount: { type: 'number', example: 2 },
            },
          },
        },
      },
    },
  })
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
  @ApiResponse({
    status: 200,
    description:
      '채팅방 조회 성공 (messages의 sender, receiver는 firstUser 형식과 동일)',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '채팅방이 조회되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            leaveRoom: {
              type: 'array',
              items: { type: 'string' },
              nullable: true,
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
            firstUser: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '77e88f4b-5ff5-47f9-9b3b-b1757c491cbb',
                },
                nickname: { type: 'string', example: '은리닉네임' },
                profileAnimal: { type: 'string', example: '곰돌이' },
                profileItems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      animal: { type: 'string', example: '곰돌이' },
                      emoji: {
                        type: 'object',
                        properties: {
                          id: { type: 'number', example: 6 },
                          animal: { type: 'string', example: '곰돌이' },
                          itemType: { type: 'string', example: 'emoji' },
                          name: { type: 'string', example: 'ㅏ아아' },
                          price: { type: 'number', example: 100 },
                          image: { type: 'string', example: '' },
                          purchasedCount: { type: 'number', example: 1 },
                          createdAt: {
                            type: 'string',
                            example: '2024-02-21T07:12:35.837Z',
                          },
                          updatedAt: {
                            type: 'string',
                            example: '2024-02-21T07:14:50.000Z',
                          },
                          deletedAt: {
                            type: 'string',
                            example: null,
                          },
                        },
                      },
                      wallpaper: { type: 'object', properties: {} },
                      background: { type: 'object', properties: {} },
                      frame: { type: 'object', properties: {} },
                    },
                  },
                },
              },
            },
            secondUser: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '77e88f4b-5ff5-47f9-9b3b-b1757c491cbb',
                },
                nickname: { type: 'string', example: '은리닉네임' },
                profileAnimal: { type: 'string', example: '곰돌이' },
                profileItems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      animal: { type: 'string', example: '곰돌이' },
                      emoji: {
                        type: 'object',
                        properties: {
                          id: { type: 'number', example: 6 },
                          animal: { type: 'string', example: '곰돌이' },
                          itemType: { type: 'string', example: 'emoji' },
                          name: { type: 'string', example: 'ㅏ아아' },
                          price: { type: 'number', example: 100 },
                          image: { type: 'string', example: '' },
                          purchasedCount: { type: 'number', example: 1 },
                          createdAt: {
                            type: 'string',
                            example: '2024-02-21T07:12:35.837Z',
                          },
                          updatedAt: {
                            type: 'string',
                            example: '2024-02-21T07:14:50.000Z',
                          },
                          deletedAt: {
                            type: 'string',
                            example: null,
                          },
                        },
                      },
                      wallpaper: { type: 'object', properties: {} },
                      background: { type: 'object', properties: {} },
                      frame: { type: 'object', properties: {} },
                    },
                  },
                },
              },
            },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 33 },
                  sender: { type: 'string', example: '발신자 id' },
                  receiver: { type: 'string', example: '수신자 id' },
                  content: { type: 'string', example: '안녕하세요' },
                  isRead: { type: 'boolean', example: false },
                  createdAt: {
                    type: 'string',
                    example: '2024-02-23T16:18:23.621Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '유저가 속한 채팅방이 아닙니다.',
  })
  @ApiResponse({
    status: 404,
    description: '채팅방을 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '채팅방의 메세지를 찾을 수 없습니다.',
  })
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
  @ApiResponse({
    status: 200,
    description: '채팅방을 나갔습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '채팅방을 나갔습니다.',
        },
      },
    },
  })
  async leaveRoom(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.messagesService.leaveRoom(+id, req.user);
    return HttpResponse.success('채팅방을 나갔습니다.');
  }
}
