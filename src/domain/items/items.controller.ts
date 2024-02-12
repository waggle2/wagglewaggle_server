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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '동물별 아이템 조회' })
  @ApiResponse({
    status: 200,
    description: '동물별 아이템이 조회되었습니다.',
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
    @Body('animal') animal: Animal,
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
    description: '장바구니가 조회되었습니다.',
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
    description: '아이템 구매가 완료되었습니다.',
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
  // TODO: 유저가 가진 아이템 조회 → *user*.items 조회할 때 아이템 최신순으로
  // TODO: 아이템 착용 → 만약 아이템 동물과 유저 동물이 같지 않다면 오류, 아이템 타입이 같은 건 덮어씌우기
  // TODO: 아이템 착용 취소
  // TODO: 아이템 판매 → +포인트

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
