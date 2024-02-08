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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ItemType } from '@/@types/enum/item-type.enum';
import RequestWithUser from '../authentication/interfaces/request-with-user.interface';
import { JwtAuthenticationGuard } from '../authentication/guards/jwt-authentication.guard';

@Controller('items')
@ApiTags('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /* 포인트샵 페이지 */
  @Get('/cat')
  @ApiOperation({ summary: '고양이 아이템 조회' })
  async findCatItems(@Query('itemType') itemType: ItemType) {
    return await this.itemsService.findCatItems(itemType);
  }

  @Get('/dog')
  @ApiOperation({ summary: '개 아이템 조회' })
  async findDogItems(@Query('itemType') itemType: ItemType) {
    return await this.itemsService.findDogItems(itemType);
  }

  @Get('/fox')
  @ApiOperation({ summary: '여우 아이템 조회' })
  async findFoxItems(@Query('itemType') itemType: ItemType) {
    return await this.itemsService.findFoxItems(itemType);
  }

  @Get('/bear')
  @ApiOperation({ summary: '곰 아이템 조회' })
  async findBearItems(@Query('itemType') itemType: ItemType) {
    return await this.itemsService.findBearItems(itemType);
  }

  @HttpCode(200)
  @Post(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '장바구니에 아이템 추가' })
  async addToCart(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.itemsService.addToCart(+id, req.user);
    return { message: '장바구니에 아이템이 추가되었습니다.' };
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '장바구니 조회' })
  async getCartItems(@Req() req: RequestWithUser) {
    return await this.itemsService.getCartItems(req.user);
  }

  @Patch()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '장바구니 전체 아이템 구매' })
  async purchaseAllCartItems(@Req() req: RequestWithUser) {
    const remainingPoints = await this.itemsService.purchaseAllCartItems(
      req.user,
    );
    return {
      message: '아이템 구매가 완료되었습니다.',
      points: remainingPoints,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '장바구니 아이템 취소' })
  async removeFromCart(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.itemsService.removeFromCart(+id, req.user);
    return { message: '장바구니에서 선택한 아이템이 삭제되었습니다.' };
  }

  @Delete()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: '장바구니 전체 아이템 취소' })
  async removeAllFromCart(@Req() req: RequestWithUser) {
    await this.itemsService.removeAllFromCart(req.user);
    return { message: '장바구니의 전체 아이템이 삭제되었습니다.' };
  }

  // TODO: 아이템 조회 페이지네이션 적용 전
  // TODO: 스웨거 작성

  /* 마이페이지 */
  // TODO: 유저가 가진 아이템 조회 → *user*.items 조회할 때 아이템 최신순으로
  // TODO: 아이템 착용 → 만약 아이템 동물과 유저 동물이 같지 않다면 오류, 아이템 타입이 같은 건 덮어씌우기
  // TODO: 아이템 착용 취소
  // TODO: 아이템 판매 → +포인트

  /* 관리자 페이지 */
  @Post()
  @ApiOperation({ summary: '아이템 생성' })
  async create(@Body() createItemDto: CreateItemDto) {
    return await this.itemsService.create(createItemDto);
  }

  @Get('/admins')
  @ApiOperation({ summary: '전체 아이템 조회' })
  async findAll() {
    return await this.itemsService.findAll();
  }

  @Get('/admins/:id')
  @ApiOperation({ summary: '아이템 상세 조회' })
  async findOne(@Param('id') id: string) {
    return await this.itemsService.findOne(+id);
  }

  @Patch('/admins/:id')
  @ApiOperation({ summary: '아이템 수정' })
  async update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return await this.itemsService.update(+id, updateItemDto);
  }

  @Delete('/admins/:id')
  @ApiOperation({ summary: '아이템 삭제' })
  async remove(@Param('id') id: string) {
    await this.itemsService.remove(+id);
    return { message: 'Item has been soft deleted successfully' };
  }
}
