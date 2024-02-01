import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionFilter } from '@/filter/exception.filter';
import * as cookieParser from 'cookie-parser';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter());

  app.enableCors({
    origin: [process.env.LOCAL_DOMAIN, process.env.DEV_DOMAIN],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true,
  });
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('wagglewaggle API')
    .setDescription('와글와글 API 문서입니다')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/api-docs', app, document);

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
