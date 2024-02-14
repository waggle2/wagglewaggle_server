import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AllExceptionFilter } from '@/lib/filter/exception.filter';
import * as cookieParser from 'cookie-parser';
import * as process from 'process';
import { swaggerConfigFactory } from '@/lib/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter());

  app.enableCors({
    origin: [process.env.LOCAL_DOMAIN, process.env.DEV_DOMAIN],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true,
  });
  app.use(cookieParser());

  const swaggerConfig = swaggerConfigFactory();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/api-docs', app, document);

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
