import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from '@/lib/config/multer-options.factory';
import { FilesService } from '@/domain/files/files.service';
import { PostsModule } from '@/domain/posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '@/domain/posts/entities/post.entity';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: multerOptionsFactory,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Post]),
    PostsModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
