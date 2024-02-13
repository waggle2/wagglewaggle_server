import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { ItemType } from '@/@types/enum/item-type.enum';
import { Animal } from '@/@types/enum/animal.enum';
import { User } from '../users/entities/user.entity';
import { ItemCart } from './entities/item-cart.entity';
import {
  ItemBadRequestException,
  ItemNotFoundException,
} from '@/lib/exceptions/domain/items.exception';
import { ProfileItems } from '../users/entities/profile-items.entity';
import ItemWithOwnership from './interfaces/item-with-ownership.interface';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemCart)
    private readonly itemCartRepository: Repository<ItemCart>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProfileItems)
    private readonly profileItemsRepository: Repository<ProfileItems>,
  ) {}

  /* 포인트샵 페이지 */

  // 동물별 아이템 조회
  async findItemsByAnimalAndType(
    animal: Animal,
    itemType: ItemType,
    user: User,
  ): Promise<{
    items: ItemWithOwnership[];
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

    const itemsWithOwnership: ItemWithOwnership[] = items.map((item) => {
      const isOwned =
        user.items && user.items.find((itemId) => Number(itemId) === item.id);
      return { ...item, isOwned: !!isOwned };
    });

    return { items: itemsWithOwnership, points };
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
    if (!itemCart || !itemCart.items) {
      throw new ItemNotFoundException(`Cart not found for user ${user.id}`);
    } else if (itemCart.items.length === 0) {
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

  /* 마이페이지 */

  // 유저가 갖고 있는 아이템 조회
  async getUserItems(
    animal: Animal,
    itemType: ItemType,
    user: User,
  ): Promise<Item[]> {
    const userItemIds = user.items || [];

    const userItems = await this.itemRepository.find({
      where: {
        id: In(userItemIds.map((id) => parseInt(id.toString()))),
        animal,
        itemType,
      },
      order: { createdAt: 'DESC' },
    });

    return userItems;
  }

  // 유저가 착용하고 있는 아이템 조회
  async getUserProfileItems(animal: Animal, user: User): Promise<ProfileItems> {
    const userProfileItems = await this.profileItemsRepository
      .createQueryBuilder('profileItems')
      .leftJoin('profileItems.user', 'user')
      .leftJoinAndSelect('profileItems.emoji', 'emoji')
      .leftJoinAndSelect('profileItems.background', 'background')
      .leftJoinAndSelect('profileItems.frame', 'frame')
      .leftJoinAndSelect('profileItems.wallpaper', 'wallpaper')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('profileItems.animal = :animal', { animal })
      .getOne();

    return userProfileItems;
  }

  // 선택한 아이템 착용
  async equipItemToProfile(
    animal: Animal,
    itemIds: number[],
    user: User,
  ): Promise<ProfileItems> {
    const itemsToEquip = await this.itemRepository
      .createQueryBuilder('item')
      .where('item.id IN (:...itemIds)', { itemIds })
      .getMany();

    // 중복되는 아이템 타입이 있는지 확인
    const itemTypes = itemsToEquip.map((item) => item.itemType);
    if (new Set(itemTypes).size !== itemTypes.length) {
      throw new ItemBadRequestException('아이템 타입이 중복되었습니다.');
    }

    const userProfileItems = await this.profileItemsRepository
      .createQueryBuilder('profileItems')
      .leftJoin('profileItems.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('profileItems.animal = :animal', { animal })
      .getMany();
    if (userProfileItems) {
      await this.profileItemsRepository.remove(userProfileItems);
    }

    const newProfileItems = this.profileItemsRepository.create({
      user: { id: user.id },
      animal: animal,
    });

    itemsToEquip.forEach((item) => {
      if (item.animal !== animal) {
        throw new ItemBadRequestException(
          '선택한 동물과 일치하지 않는 아이템입니다.',
        );
      }
      switch (item.itemType) {
        case ItemType.EMOJI:
          newProfileItems.emoji = item;
          break;
        case ItemType.BACKGROUND:
          newProfileItems.background = item;
          break;
        case ItemType.FRAME:
          newProfileItems.frame = item;
          break;
        case ItemType.WALLPAPER:
          newProfileItems.wallpaper = item;
          break;
      }
    });

    if (!newProfileItems.emoji) newProfileItems.emoji = null;
    if (!newProfileItems.background) newProfileItems.background = null;
    if (!newProfileItems.frame) newProfileItems.frame = null;
    if (!newProfileItems.wallpaper) newProfileItems.wallpaper = null;

    await this.profileItemsRepository.save(newProfileItems);
    return newProfileItems;
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
