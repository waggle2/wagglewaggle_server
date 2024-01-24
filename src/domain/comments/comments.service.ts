import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly postService: PostsService,
  ) {}

  async findAll(): Promise<Comment[]> {
    return await this.commentRepository.find({
      withDeleted: true,
    });
  }

  async findOne(id: number): Promise<Comment | null> {
    const comment = await this.commentRepository.findOne({
      where: { id, deletedAt: undefined },
    });
    if (!comment) throw new NotFoundException('댓글이 존재하지 않습니다.');
    return comment;
  }

  async create(
    postId: number,
    commentData: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postService.findOne(postId);
    const newComment = this.commentRepository.create({
      ...commentData,
      post: { id: post?.id },
    });
    return await this.commentRepository.save(newComment);
  }

  async remove(id: number) {
    const existingComment = await this.findOne(id);
    if (!existingComment) {
      throw new NotFoundException(`Comment with ID ${id} not found.`);
    }

    await this.commentRepository.update(id, { deletedAt: new Date() });

    return this.commentRepository.findOneBy({ id });
  }

  async update(id: number, updateData: UpdateCommentDto) {
    const existingComment = await this.findOne(id);
    if (!existingComment) {
      throw new NotFoundException(`Comment with ID ${id} not found.`);
    }

    await this.commentRepository.update(id, updateData);

    return this.findOne(id);
  }
}
