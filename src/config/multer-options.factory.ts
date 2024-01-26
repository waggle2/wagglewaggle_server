import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as mime from 'mime-types';
import * as multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

export const multerOptionsFactory = (
  configService: ConfigService,
): MulterOptions => {
  const s3 = new S3Client({
    region: configService.get('AWS_REGION'),
    credentials: {
      accessKeyId: configService.get('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_S3_SECRET_ACCESS_KEY'),
    },
  });

  return {
    storage: multerS3({
      s3,
      bucket: configService.get('AWS_S3_BUCKET'),
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key(
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: any, key?: string) => void,
      ) {
        const fileName = `${Date.now()}.${mime.extension(file.mimetype)}`;
        callback(null, fileName);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB 제한
      files: 10,
    },
  };
};
