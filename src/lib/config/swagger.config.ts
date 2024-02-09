import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfigFactory = () => {
  return new DocumentBuilder()
    .setTitle('wagglewaggle API')
    .setDescription('와글와글 API 문서입니다')
    .setVersion('1.0')
    .addSecurity('Authorization', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'Token',
      name: 'Authorization',
      description: '인증 토큰 값을 넣어주세요.',
      in: 'header',
    })
    .build();
};
