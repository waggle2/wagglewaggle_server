import { Module } from '@nestjs/common';
import { PresignUrlsController } from './presign-urls.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PresignUrlsController],
})
export class PresignUrlsModule {}
