import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({
      relations: ['posts'],
    });
  }

  async findOne(id: number): Promise<Category | null> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['posts'],
    });
    if (!category)
      throw new NotFoundException('해당 카테고리가 존재하지 않습니다.');
    return category;
  }
}
