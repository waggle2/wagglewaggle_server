import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { ItemTypeEnumRefactoring1710410177498 } from './1710410177498-itemTypeEnumRefactoring';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get(`DB_HOST`),
  port: configService.get(`DB_PORT`),
  username: configService.get(`DB_USERNAME`),
  password: configService.get(`DB_PASSWORD`),
  database: configService.get(`DB_NAME`),
  entities: [__dirname + '/../**/*.entities.{js,ts}'],
  migrations: [ItemTypeEnumRefactoring1710410177498],
});
