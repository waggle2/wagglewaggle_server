import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PresignUrlsDto } from '@/domain/presign-urls/dto/presign-urls.dto';
import { createS3Client } from '@/config/s3.config';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

@Controller('presign-urls')
export class PresignUrlsController {
  constructor(private readonly configService: ConfigService) {}

  @Post('')
  async presignPost(@Body() presignUrlsDto: PresignUrlsDto) {
    const { filename, type } = presignUrlsDto;
    const s3Client = createS3Client(this.configService);

    return await createPresignedPost(s3Client, {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: filename,
      Conditions: [['content-length-range', 0, 5 * 1024 * 1024]],
      Expires: 600,
    });
  }
}
