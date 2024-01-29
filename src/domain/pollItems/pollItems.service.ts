import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePollItemDto } from './dto/create-pollItem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PollItem } from './entities/pollItem.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PollItemsService {
  constructor(
    @InjectRepository(PollItem)
    private readonly pollItemsRepository: Repository<PollItem>,
  ) {}

  async create(createPollItemDto: CreatePollItemDto) {
    const pollItem = this.pollItemsRepository.create(createPollItemDto);
    return await this.pollItemsRepository.save(pollItem);
  }

  async findAll() {
    return await this.pollItemsRepository.find();
  }

  async findOne(id: number) {
    const pollItem = await this.pollItemsRepository.findOneBy({ id });
    if (!pollItem) {
      throw new NotFoundException('해당 투표 항목이 존재하지 않습니다');
    }
    return pollItem;
  }

  async update(id: number, pollItemDto: CreatePollItemDto) {
    await this.pollItemsRepository.update(id, pollItemDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const pollItem = await this.findOne(id);
    return await this.pollItemsRepository.remove([pollItem]);
  }

  async removeMultiple(ids: number[]) {
    const pollItems = await Promise.all(ids.map((id) => this.findOne(id)));
    return await this.pollItemsRepository.remove(pollItems);
  }
}
