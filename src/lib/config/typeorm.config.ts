import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function TypeormConfig(configService: ConfigService) {
  const env = configService.get('NODE_ENV');
  const logging = configService.get<string>('DB_LOGGING') === 'true';
  const DB_TYPE: 'mysql' | null = 'mysql';
  const isDev = env !== 'production';

  const option: TypeOrmModuleOptions = {
    type: DB_TYPE,
    host: configService.get(`DB_HOST`),
    port: configService.get(`DB_PORT`),
    username: configService.get(`DB_USERNAME`),
    password: configService.get(`DB_PASSWORD`),
    database: configService.get(`DB_NAME`),
    autoLoadEntities: true,
    synchronize: isDev,
    // dropSchema: isDev,
    logging: logging,
  };

  return option;
}
