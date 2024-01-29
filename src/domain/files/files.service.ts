import { Injectable } from '@nestjs/common';
import { PostsService } from '@/domain/posts/posts.service';
import { UploadFilesDto } from '@/domain/files/dto/upload-files.dto';
import { Repository } from 'typeorm';
import { Post } from '@/domain/posts/entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly postsService: PostsService,
  ) {}

  async uploadImagesToPost(
    files: Express.Multer.File[],
    uploadFilesDto: UploadFilesDto,
  ) {
    const { postId } = uploadFilesDto;
    await this.postsService.findOne(postId);
    const imageUrls = files.map((file) => file['location']);
    await this.postsRepository.update(postId, { imageUrls });
  }
}
