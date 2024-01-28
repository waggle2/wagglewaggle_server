import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from '../posts/posts.service';
import { Post } from '@/domain/posts/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly postService: PostsService,
  ) {}

  async findAll(): Promise<Comment[]> {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.deleted_at IS NULL');

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Comment | null> {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.replies', 'replies')
      .where('comment.deleted_at IS NULL')
      .andWhere('comment.id = :id', { id });

    const comment = await queryBuilder.getOne();

    if (!comment) throw new NotFoundException('댓글이 존재하지 않습니다.');
    return comment;
  }

  async create(
    postId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postService.findOne(postId);
    const newComment = this.commentRepository.create({
      ...createCommentDto,
      post: { id: post?.id },
    });

    post.commentNum++;
    await this.postsRepository.save(post);

    return await this.commentRepository.save(newComment);
  }

  async addReply(parentId: number, createCommentDto: CreateCommentDto) {
    const parent = await this.findOne(parentId);
    if (!parent) {
      throw new NotFoundException('부모 댓글을 찾을 수 없습니다.');
    }

    const newComment = this.commentRepository.create({
      ...createCommentDto,
      parent: { id: parent.id },
    });

    const post = parent.post;
    post.commentNum++;
    await this.postsRepository.save(post);

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
