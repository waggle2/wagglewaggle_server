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

  // 동물별 아이템 조회
  async findItemsByAnimalAndType(
    animal: Animal,
    itemType: ItemType,
    user: User,
  ): Promise<{
    items: Item[];
    points: number;
  }> {
    const items = await this.itemRepository.find({
      where: { animal, itemType },
      order: { createdAt: 'DESC' },
    });

    let points: number;
    switch (animal) {
      case Animal.BEAR:
        points = user.bearPoints;
        break;
      case Animal.CAT:
        points = user.catPoints;
        break;
      case Animal.DOG:
        points = user.dogPoints;
        break;
      case Animal.FOX:
        points = user.foxPoints;
        break;
    }
    return { items, points };
  }

  // 장바구니에 아이템 추가
  async addToCart(id: number, animal: Animal, user: User): Promise<void> {
    const item = await this.findOne(id);
    const itemCart = await this.itemCartRepository
      .createQueryBuilder('item_cart')
      .leftJoinAndSelect('item_cart.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('item_cart.animal = :animal', { animal })
      .getOne();
    if (!itemCart || !itemCart.items) {
      throw new ItemNotFoundException(`Cart not found for user ${user.id}`);
    } else if (itemCart.items.find((itemId) => Number(itemId) === item.id)) {
      throw new ItemBadRequestException(
        '장바구니에 이미 같은 아이템이 있습니다.',
      );
    } else if (item.animal !== animal) {
      throw new ItemBadRequestException(
        '아이템이 해당 동물 장바구니와 일치하지 않습니다.',
      );
    }

    itemCart.items.unshift(item.id);
    itemCart.totalPoints += item.price; // 총 포인트에 해당 아이템 가격 더하기
    await this.itemCartRepository.save(itemCart);
  }

  // 장바구니 조회
  async getCartItems(
    animal: Animal,
    user: User,
  ): Promise<{ items: Item[]; totalPoints: number }> {
    const itemCart = await this.itemCartRepository
      .createQueryBuilder('item_cart')
      .leftJoinAndSelect('item_cart.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('item_cart.animal = :animal', { animal })
      .getOne();
    if (!itemCart || !itemCart.items) {
      throw new ItemNotFoundException(`Cart not found for user ${user.id}`);
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
  async purchaseAllCartItems(animal: Animal, user: User): Promise<number> {
    const itemCart = await this.itemCartRepository
      .createQueryBuilder('item_cart')
      .leftJoinAndSelect('item_cart.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('item_cart.animal = :animal', { animal })
      .getOne();
    if (!itemCart) {
      throw new ItemNotFoundException(`Cart not found for user ${user.id}`);
    } else if (!itemCart.items) {
      throw new ItemBadRequestException('No items selected.');
    }

    let pointsField: string;
    switch (animal) {
      case Animal.BEAR:
        pointsField = 'bearPoints';
        break;
      case Animal.CAT:
        pointsField = 'catPoints';
        break;
      case Animal.DOG:
        pointsField = 'dogPoints';
        break;
      case Animal.FOX:
        pointsField = 'foxPoints';
        break;
    }
    if (user[pointsField] < itemCart.totalPoints) {
      throw new ItemBadRequestException('포인트가 부족합니다.');
    }
    user[pointsField] -= itemCart.totalPoints;
    const itemsArray = await this.itemRepository
      .createQueryBuilder('item')
      .whereInIds(itemCart.items)
      .getMany();
    user.items = user.items
      ? [...user.items, ...itemCart.items]
      : itemCart.items;
    await this.userRepository.save(user);
    for (const item of itemsArray) {
      item.purchasedCount += 1; // 아이템 구매 수량 +1
      await this.itemRepository.save(item);
    }
    itemCart.items = [];
    itemCart.totalPoints = 0;
    await this.itemCartRepository.save(itemCart);

    return user[pointsField];
  }

  // 장바구니 아이템 취소
  async removeFromCart(id: number, animal: Animal, user: User): Promise<void> {
    const item = await this.findOne(id);
    const itemCart = await this.itemCartRepository
      .createQueryBuilder('item_cart')
      .leftJoinAndSelect('item_cart.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('item_cart.animal = :animal', { animal })
      .getOne();
    if (!itemCart) {
      throw new ItemNotFoundException(`Cart not found for user ${user.id}`);
    }

    itemCart.items = itemCart.items.filter((itemId) => Number(itemId) !== id);
    itemCart.totalPoints -= item.price; // 총 포인트에 해당 아이템 가격 빼기
    await this.itemCartRepository.save(itemCart);
  }

  // 장바구니 전체 아이템 취소
  async removeAllFromCart(animal: Animal, user: User): Promise<void> {
    const itemCart = await this.itemCartRepository
      .createQueryBuilder('item_cart')
      .leftJoinAndSelect('item_cart.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('item_cart.animal = :animal', { animal })
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
