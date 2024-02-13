import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ItemType } from '@/@types/enum/item-type.enum';
import RequestWithUser from '../authentication/interfaces/request-with-user.interface';
import { JwtAuthenticationGuard } from '../authentication/guards/jwt-authentication.guard';
import { Animal } from '@/@types/enum/animal.enum';
import { HttpResponse } from '@/@types/http-response';

@Controller('items')
@ApiTags('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /* 포인트샵 페이지 */
  @Get('/animals')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '동물별 아이템 조회' })
  @ApiResponse({
    status: 200,
    description:
      '동물별 아이템 조회, 유저 해당 동물 포인트, 아이템 보유 여부(isOwned)',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '동물별 아이템이 조회되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  animal: { type: 'string' },
                  itemType: { type: 'string' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  image: { type: 'string' },
                  purchasedCount: { type: 'number' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  deletedAt: { type: 'string', format: 'date-time' },
                  isOwned: { type: 'boolean' },
                },
              },
            },
            points: { type: 'number', example: 200 },
          },
        },
      },
    },
  })
  async findItemsByAnimalAndType(
    @Query('animal') animal: Animal,
    @Query('itemType') itemType: ItemType,
    @Req() req: RequestWithUser,
  ) {
    const items = await this.itemsService.findItemsByAnimalAndType(
      animal,
      itemType,
      req.user,
    );
    return HttpResponse.success('동물별 아이템이 조회되었습니다.', items);
  }

  @HttpCode(200)
  @Post('/cart/:id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '장바구니에 아이템 추가' })
  @ApiResponse({
    status: 200,
    description: '장바구니에 아이템이 추가되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '장바구니에 아이템이 추가되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '장바구니에 이미 같은 아이템이 있습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '아이템이 해당 동물 장바구니와 일치하지 않습니다.',
  })
  async addToCart(
    @Param('id') id: string,
    @Query('animal') animal: Animal,
    @Req() req: RequestWithUser,
  ) {
    await this.itemsService.addToCart(+id, animal, req.user);
    return HttpResponse.success('장바구니에 아이템이 추가되었습니다.');
  }

  @Get('/cart')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '장바구니 조회' })
  @ApiResponse({
    status: 200,
    description: '장바구니 조회, 선택한 아이템 총 포인트',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '장바구니가 조회되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  animal: { type: 'string' },
                  itemType: { type: 'string' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  image: { type: 'string' },
                  purchasedCount: { type: 'number' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  deletedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            totalPoints: { type: 'number', example: 200 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found for user ${user.id}',
  })
  async getCartItems(
    @Query('animal') animal: Animal,
    @Req() req: RequestWithUser,
  ) {
    const cart = await this.itemsService.getCartItems(animal, req.user);
    return HttpResponse.success('장바구니가 조회되었습니다.', cart);
  }

  @Patch('/cart')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '장바구니 전체 아이템 구매' })
  @ApiResponse({
    status: 200,
    description: '아이템 구매가 완료, 남은 해당 동물 포인트',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '아이템 구매가 완료되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            points: {
              type: 'number',
              example: 200,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No items selected.',
  })
  @ApiResponse({
    status: 400,
    description: '포인트가 부족합니다.',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found for user ${user.id}',
  })
  async purchaseAllCartItems(
    @Query('animal') animal: Animal,
    @Req() req: RequestWithUser,
  ) {
    const remainingPoints = await this.itemsService.purchaseAllCartItems(
      animal,
      req.user,
    );
    return HttpResponse.success('아이템 구매가 완료되었습니다.', {
      points: remainingPoints,
    });
  }

  @Delete('/cart/:id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '장바구니 아이템 취소' })
  @ApiResponse({
    status: 200,
    description: '장바구니에서 선택한 아이템이 삭제되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '장바구니에서 선택한 아이템이 삭제되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found for user ${user.id}',
  })
  async removeFromCart(
    @Param('id') id: string,
    @Query('animal') animal: Animal,
    @Req() req: RequestWithUser,
  ) {
    await this.itemsService.removeFromCart(+id, animal, req.user);
    return HttpResponse.success('장바구니에서 선택한 아이템이 삭제되었습니다.');
  }

  @Delete('/cart')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '장바구니 전체 아이템 취소' })
  @ApiResponse({
    status: 200,
    description: '장바구니의 전체 아이템이 삭제되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '장바구니의 전체 아이템이 삭제되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found for user ${user.id}',
  })
  async removeAllFromCart(
    @Query('animal') animal: Animal,
    @Req() req: RequestWithUser,
  ) {
    await this.itemsService.removeAllFromCart(animal, req.user);
    return HttpResponse.success('장바구니의 전체 아이템이 삭제되었습니다.');
  }

  /* 마이페이지 */
  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '유저가 갖고 있는 아이템 조회(마이페이지)' })
  @ApiResponse({
    status: 200,
    description: '유저가 갖고 있는 아이템이 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '유저가 갖고 있는 아이템이 조회되었습니다.',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              animal: { type: 'string' },
              itemType: { type: 'string' },
              name: { type: 'string' },
              price: { type: 'number' },
              image: { type: 'string' },
              purchasedCount: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getUserItems(
    @Query('animal') animal: Animal,
    @Query('itemType') itemType: ItemType,
    @Req() req: RequestWithUser,
  ) {
    const items = await this.itemsService.getUserItems(
      animal,
      itemType,
      req.user,
    );
    return HttpResponse.success(
      '유저가 갖고 있는 아이템이 조회되었습니다.',
      items,
    );
  }

  @Get('/profile')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '유저가 착용하고 있는 아이템 조회(마이페이지)' })
  @ApiResponse({
    status: 200,
    description:
      '착용 아이템 조회, emoji, frame, wallpaper, background의 경우 없다면 null',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '유저가 착용하고 있는 아이템이 조회되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            animal: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
            },
            emoji: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                animal: { type: 'string' },
                itemType: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                image: { type: 'string' },
                purchasedCount: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deletedAt: { type: 'string', format: 'date-time' },
              },
            },
            background: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                animal: { type: 'string' },
                itemType: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                image: { type: 'string' },
                purchasedCount: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deletedAt: { type: 'string', format: 'date-time' },
              },
            },
            frame: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                animal: { type: 'string' },
                itemType: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                image: { type: 'string' },
                purchasedCount: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deletedAt: { type: 'string', format: 'date-time' },
              },
            },
            wallpaper: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                animal: { type: 'string' },
                itemType: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                image: { type: 'string' },
                purchasedCount: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deletedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
  })
  async getUserProfileItems(
    @Query('animal') animal: Animal,
    @Req() req: RequestWithUser,
  ) {
    const items = await this.itemsService.getUserProfileItems(animal, req.user);
    return HttpResponse.success(
      '유저가 착용하고 있는 아이템이 조회되었습니다.',
      items,
    );
  }

  @Patch('/profile')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '선택한 아이템 착용(마이페이지)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        animal: {
          type: 'string',
          example: 'example@example.com',
        },
        itemIds: {
          type: 'array',
          items: {
            type: 'number',
            example: [1, 2, 3],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      '선택한 아이템 착용, emoji, frame, wallpaper, background의 경우 없다면 null',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '선택한 아이템을 착용하였습니다.',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            animal: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
            },
            emoji: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                animal: { type: 'string' },
                itemType: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                image: { type: 'string' },
                purchasedCount: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deletedAt: { type: 'string', format: 'date-time' },
              },
            },
            background: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                animal: { type: 'string' },
                itemType: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                image: { type: 'string' },
                purchasedCount: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deletedAt: { type: 'string', format: 'date-time' },
              },
            },
            frame: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                animal: { type: 'string' },
                itemType: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                image: { type: 'string' },
                purchasedCount: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deletedAt: { type: 'string', format: 'date-time' },
              },
            },
            wallpaper: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                animal: { type: 'string' },
                itemType: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                image: { type: 'string' },
                purchasedCount: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                deletedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '아이템 타입이 중복되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '선택한 동물과 일치하지 않는 아이템입니다.',
  })
  async equipItemToProfile(
    @Body('animal') animal: Animal,
    @Body('itemIds') itemIds: number[],
    @Req() req: RequestWithUser,
  ) {
    const profileItems = await this.itemsService.equipItemToProfile(
      animal,
      itemIds,
      req.user,
    );
    return HttpResponse.success(
      '선택한 아이템을 착용하였습니다.',
      profileItems,
    );
  }

  /* 관리자 페이지 */
  @Post()
  @ApiOperation({ summary: '아이템 생성(관리자)' })
  @ApiResponse({
    status: 201,
    description: '아이템이 생성되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: '아이템이 생성되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            animal: { type: 'string' },
            itemType: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            image: { type: 'string' },
            purchasedCount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async create(@Body() createItemDto: CreateItemDto) {
    const item = await this.itemsService.create(createItemDto);
    return HttpResponse.success('아이템이 생성되었습니다.', item);
  }

  @Get('/admins')
  @ApiOperation({ summary: '전체 아이템 조회(관리자)' })
  @ApiResponse({
    status: 200,
    description: '전체 아이템이 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '전체 아이템이 조회되었습니다.',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              animal: { type: 'string' },
              itemType: { type: 'string' },
              name: { type: 'string' },
              price: { type: 'number' },
              image: { type: 'string' },
              purchasedCount: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async findAll() {
    const items = await this.itemsService.findAll();
    return HttpResponse.success('전체 아이템이 조회되었습니다.', items);
  }

  @Get('/admins/:id')
  @ApiOperation({ summary: '아이템 상세 조회(관리자)' })
  @ApiResponse({
    status: 200,
    description: '아이템이 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '아이템이 조회되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            animal: { type: 'string' },
            itemType: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            image: { type: 'string' },
            purchasedCount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Item with id ${id} not found',
  })
  async findOne(@Param('id') id: string) {
    const item = await this.itemsService.findOne(+id);
    return HttpResponse.success('아이템이 조회되었습니다.', item);
  }

  @Patch('/admins/:id')
  @ApiOperation({ summary: '아이템 수정(관리자)' })
  @ApiResponse({
    status: 200,
    description: '아이템이 수정되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '아이템이 수정되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            animal: { type: 'string' },
            itemType: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            image: { type: 'string' },
            purchasedCount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    const item = await this.itemsService.update(+id, updateItemDto);
    return HttpResponse.success('아이템이 수정되었습니다.', item);
  }

  @Delete('/admins/:id')
  @ApiOperation({ summary: '아이템 삭제(관리자)' })
  @ApiResponse({
    status: 200,
    description: '아이템이 삭제되었습니다.',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: '아이템이 삭제되었습니다.',
        },
      },
    },
  })
  async remove(@Param('id') id: string) {
    await this.itemsService.remove(+id);
    return HttpResponse.success('아이템이 삭제되었습니다.');
  }
}
