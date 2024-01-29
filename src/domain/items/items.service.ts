import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const newItem = this.itemRepository.create(createItemDto);
    return await this.itemRepository.save(newItem);
  }

  async findAll(): Promise<Item[]> {
    return await this.itemRepository.find();
  }

  async findOne(id: number): Promise<Item> {
    return await this.itemRepository.findOneBy({ id });
  }

  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
    const itemToUpdate = await this.findOne(id);
    if (!itemToUpdate) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    const updatedItem = Object.assign(itemToUpdate, updateItemDto);
    return await this.itemRepository.save(updatedItem);
  }

  async remove(id: number): Promise<void> {
    const itemToRemove = await this.itemRepository.findOne({
      where: { id, deletedAt: undefined },
    });
    if (!itemToRemove) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    await this.itemRepository.softDelete(id);
  }
}
