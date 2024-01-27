import { Body, Controller, Delete, Post, UploadedFiles } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadFilesDto } from '@/domain/files/dto/upload-files.dto';
import { FilesService } from '@/domain/files/files.service';
import { createS3Client } from '@/config/s3.config';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { DeleteFilesDto } from '@/domain/files/dto/delete-files.dto';
import { FilesDecorator } from '@/domain/files/decorators/files.decorator';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @FilesDecorator('files')
  @ApiOperation({ summary: '파일 여러 개 업로드' })
  @Post()
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadFilesDto: UploadFilesDto,
  ) {
    await this.filesService.uploadImagesToPost(files, uploadFilesDto);
    return { message: '이미지가 성공적으로 업로드되었습니다' };
  }

  @ApiOperation({ summary: '파일 여러 개 삭제' })
  @Delete()
  async deleteFile(@Body() deleteFilesDto: DeleteFilesDto) {
    const s3Client = createS3Client(this.configService);
    const { keys } = deleteFilesDto;
    const command = new DeleteObjectsCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Delete: {
        Objects: keys.map((key) => {
          return { Key: key };
        }),
      },
    });

    return await s3Client.send(command);
  }
}
