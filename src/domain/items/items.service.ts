import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { ItemType } from '@/@types/enum/item-type.enum';
import { Animal } from '@/@types/enum/animal.enum';
import { User } from '../users/entities/user.entity';
import { ItemCart } from './entities/item-cart.entity';
import {
  ItemBadRequestException,
  ItemNotFoundException,
} from '@/lib/exceptions/domain/items.exception';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemCart)
    private readonly itemCartRepository: Repository<ItemCart>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /* 포인트샵 페이지 */

  // 고양이 아이템 조회
  async findCatItems(itemType: ItemType): Promise<Item[]> {
    return await this.itemRepository.find({
      where: { animal: Animal.CAT, itemType },
      order: { createdAt: 'DESC' },
    });
  }

  // 개 아이템 조회
  async findDogItems(itemType: ItemType): Promise<Item[]> {
    return await this.itemRepository.find({
      where: { animal: Animal.DOG, itemType },
      order: { createdAt: 'DESC' },
    });
  }

  // 여우 아이템 조회
  async findFoxItems(itemType: ItemType): Promise<Item[]> {
    return await this.itemRepository.find({
      where: { animal: Animal.FOX, itemType },
      order: { createdAt: 'DESC' },
    });
  }

  // 곰 아이템 조회
  async findBearItems(itemType: ItemType): Promise<Item[]> {
    return await this.itemRepository.find({
      where: { animal: Animal.BEAR, itemType },
      order: { createdAt: 'DESC' },
    });
  }

  // 장바구니에 아이템 추가
  async addToCart(id: number, user: User): Promise<void> {
    const item = await this.findOne(id);
    const itemCart = await this.itemCartRepository
      .createQueryBuilder('item_cart')
      .leftJoinAndSelect('item_cart.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .getOne();
    if (!itemCart) {
      throw new ItemNotFoundException(`Cart not found for user ${user.id}`);
    }

    if (!itemCart.items) {
      itemCart.items = [];
    } else if (itemCart.items.find((itemId) => Number(itemId) === item.id)) {
      throw new ItemBadRequestException(
        '장바구니에 이미 같은 아이템이 있습니다.',
      );
    }

    itemCart.items.unshift(item.id);
    itemCart.totalPoints += item.price; // 총 포인트에 해당 아이템 가격 더하기
    await this.itemCartRepository.save(itemCart);
  }

  // 장바구니 조회
  async getCartItems(
    user: User,
  ): Promise<{ items: Item[]; totalPoints: number }> {
    const itemCart = await this.itemCartRepository
      .createQueryBuilder('item_cart')
      .leftJoinAndSelect('item_cart.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .getOne();
    if (!itemCart || !itemCart.items) {
      return { items: [], totalPoints: 0 };
    }

    const items = await this.itemRepository
      .createQueryBuilder('item')
      .whereInIds(itemCart.items)
      .getMany();

    const sortedItems = itemCart.items.map((itemId) =>
      items.find((item) => item.id === Number(itemId)),
    );

    return { items: sortedItems, totalPoints: itemCart.totalPoints };
  }

  // 장바구니 전체 아이템 구매
  async purchaseAllCartItems(user: User): Promise<number> {
    const itemCart = await this.itemCartRepository
      .createQueryBuilder('item_cart')
      .leftJoinAndSelect('item_cart.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .getOne();
    if (!itemCart) {
      throw new ItemNotFoundException(`Cart not found for user ${user.id}`);
    } else if (!itemCart.items) {
      throw new ItemBadRequestException('선택한 아이템이 없습니다.');
    }

    const itemsArray = await this.itemRepository
      .createQueryBuilder('item')
      .whereInIds(itemCart.items)
      .getMany();

    if (user.points < itemCart.totalPoints) {
      throw new ItemBadRequestException('포인트가 부족합니다.');
    }
    user.points -= itemCart.totalPoints; // 유저 포인트에서 차감
    if (!user.items) {
      user.items = itemCart.items;
    } else {
      user.items.push(...itemCart.items); // user.items에 추가
    }
    await this.userRepository.save(user);

    for (const item of itemsArray) {
      item.purchasedCount += 1; // 아이템 구매 수량 +1
      await this.itemRepository.save(item);
    }

    itemCart.items = [];
    itemCart.totalPoints = 0;
    await this.itemCartRepository.save(itemCart);

    return user.points;
  }

  // 장바구니 아이템 취소
  async removeFromCart(id: number, user: User): Promise<void> {
    const item = await this.findOne(id);
    const itemCart = await this.itemCartRepository
      .createQueryBuilder('item_cart')
      .leftJoinAndSelect('item_cart.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .getOne();
    if (!itemCart) {
      throw new ItemNotFoundException(`Cart not found for user ${user.id}`);
    }

    itemCart.items = itemCart.items.filter((itemId) => Number(itemId) !== id);
    itemCart.totalPoints -= item.price; // 총 포인트에 해당 아이템 가격 빼기
    await this.itemCartRepository.save(itemCart);
  }

  // 장바구니 전체 아이템 취소
  async removeAllFromCart(user: User): Promise<void> {
    const itemCart = await this.itemCartRepository
      .createQueryBuilder('item_cart')
      .leftJoinAndSelect('item_cart.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .getOne();
    if (!itemCart) {
      throw new ItemNotFoundException(`Cart not found for user ${user.id}`);
    }

    itemCart.items = [];
    itemCart.totalPoints = 0;
    await this.itemCartRepository.save(itemCart);
  }

  /* 관리자 페이지 */

  // 아이템 생성
  async create(createItemDto: CreateItemDto): Promise<Item> {
    const newItem = this.itemRepository.create(createItemDto);
    return await this.itemRepository.save(newItem);
  }

  // 전체 아이템 조회
  async findAll(): Promise<Item[]> {
    return await this.itemRepository.find();
  }

  // 아이템 상세 조회
  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOneBy({ id });
    if (!item) {
      throw new ItemNotFoundException(`Item with id ${id} not found`);
    }

    return item;
  }

  // 아이템 수정
  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
    const itemToUpdate = await this.findOne(id);
    const updatedItem = Object.assign(itemToUpdate, updateItemDto);
    return await this.itemRepository.save(updatedItem);
  }

  // 아이템 삭제
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.itemRepository.softDelete(id);
  }
}
