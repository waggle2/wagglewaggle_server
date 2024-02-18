import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PresignedUrlDto } from '@/domain/presign-urls/dto/presign-urls.dto';
import { createS3Client } from '@/lib/config/s3.config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 } from 'uuid';
import { HttpResponse } from '@/@types/http-response';

@ApiTags('presign-urls')
@Controller('presign-urls')
export class PresignUrlsController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({
    summary: 'presigned-url 발급',
    description:
      'Body에 파일 이름(확장자까지) 포함해서 요청을 보냅니다. ' +
      '리턴되는 "signedUrl"은 파일을 업로드할 url이고, "publicUrl"은 해당 이미지의 소스 url입니다. ' +
      '파일을 업로드할 때는 PUT 메소드로 binary 형식으로 파일을 업로드해주세요',
  })
  @ApiResponse({
    status: 201,
    description: '요청 성공',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 201 },
        message: { type: 'string', example: '요청 성공' },
        data: {
          type: 'object',
          properties: {
            signedUrl: {
              type: 'string',
              example:
                'https://wagglewaggle-dev-s3.s3.ap-northeast-2.amazonaws.com/feedd04b_5cea_40a6_a494_6d41888b4416_%ED%9A%8C.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA47CRYLWGERP5THKI%2F20240218%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Date=20240218T142158Z&X-Amz-Expires=300&X-Amz-Signature=1f1ffb30363f7a5bdb2c541bc6debcbe1093342be77a56bc6f95ae0861f2b915&X-Amz-SignedHeaders=content-length%3Bhost&x-id=PutObject',
            },
            publicUrl: {
              type: 'string',
              example:
                'https://wagglewaggle-dev-s3.s3.ap-northeast-2.amazonaws.com/feedd04b_5cea_40a6_a494_6d41888b4416_%ED%9A%8C.jpg',
            },
          },
        },
      },
    },
  })
  @Post('/')
  async presignedUrl(@Body() presignedUrlDto: PresignedUrlDto) {
    const bucketName = this.configService.get('AWS_S3_BUCKET');
    const { filename } = presignedUrlDto;
    const uuid = v4().replace(/-/g, '_');
    const key = `${uuid}_${filename}`;
    const encodedKey = encodeURIComponent(key);

    const s3Client = createS3Client(this.configService);

    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });
    const publicUrl = `https://${bucketName}.s3.ap-northeast-2.amazonaws.com/${encodedKey}`;

    return HttpResponse.created('요청 성공', { signedUrl, publicUrl });
  }
}
