import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Tag } from '@/domain/types/enum/tags.enum';
import { Animal } from '@/domain/types/enum/animal.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(animal: Animal, tags: Tag[]) {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.poll', 'poll')
      .where('post.deleted_at IS NULL');

    if (animal) {
      queryBuilder.andWhere('post.animal = :animal', {
        animal: animal.valueOf(),
      });
    }

    if (tags && tags.length > 0) {
      const tagConditions = tags.map(
        (tag, index) => `JSON_CONTAINS(post.tags, :tag${index})`,
      );
      const parameters = tags.reduce((params, tag, index) => {
        params[`tag${index}`] = JSON.stringify(tag);
        return params;
      }, {});

      queryBuilder.andWhere(`(${tagConditions.join(' AND ')})`, parameters);
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Post | null> {
    const post = await this.postRepository.findOne({
      where: { id, deletedAt: undefined },
      relations: ['comments'],
    });
    if (!post) throw new NotFoundException('게시글이 존재하지 않습니다.');
    return post;
  }

  async create(postData: CreatePostDto) {
    const newPost = this.postRepository.create(postData);
    return await this.postRepository.save(newPost);
  }

  async remove(id: number) {
    const existingPost = await this.postRepository.findOne({
      where: { id, deletedAt: undefined },
    });
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found.`);
    }

    return await this.postRepository.softDelete(id);
  }

  async update(id: number, updateData: UpdatePostDto) {
    // 먼저 해당 id의 Post가 존재하는지 확인
    const existingPost = await this.findOne(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found.`);
    }

    // Post가 존재하면 업데이트 진행
    await this.postRepository.update(id, updateData);

    // 업데이트된 Post 반환
    return this.findOne(id);
  }
}
