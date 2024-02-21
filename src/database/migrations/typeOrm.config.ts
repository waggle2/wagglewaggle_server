import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AnimalEnumRefactoring1708161878890 } from '@/database/migrations/1708161878890-AnimalEnumRefactoring';

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
  migrations: [AnimalEnumRefactoring1708161878890],
});
