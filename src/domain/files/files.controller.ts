import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadFilesDto } from '@/domain/files/dto/upload-files.dto';
import { FilesService } from '@/domain/files/files.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseInterceptors(FilesInterceptor('files'))
  @Post()
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadFilesDto: UploadFilesDto,
  ) {
    await this.filesService.uploadImagesToPost(files, uploadFilesDto);

    return { message: '이미지가 성공적으로 업로드되었습니다' };
  }
}
