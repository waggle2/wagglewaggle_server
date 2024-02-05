import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

export const createS3Client = (configService: ConfigService) => {
  return new S3Client({
    region: configService.get('AWS_REGION'),
    credentials: {
      accessKeyId: configService.get('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_S3_SECRET_ACCESS_KEY'),
    },
  });
};
