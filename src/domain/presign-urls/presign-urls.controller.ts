import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PresignUrlsDto } from '@/domain/presign-urls/dto/presign-urls.dto';
import { createS3Client } from '@/lib/config/s3.config';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('presign-urls')
@Controller('presign-urls')
export class PresignUrlsController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({
    summary: 'presign-url 발급',
  })
  @Post('')
  async presignPost(@Body() presignUrlsDto: PresignUrlsDto) {
    const { filename } = presignUrlsDto;
    const s3Client = createS3Client(this.configService);

    return await createPresignedPost(s3Client, {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: filename,
      Conditions: [['content-length-range', 0, 5 * 1024 * 1024]],
      Expires: 600,
    });
  }
}
