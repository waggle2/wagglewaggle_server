import { DynamicModule, Module } from '@nestjs/common';
import { DatabaseOption } from '@/database/DatabaseOption.interface';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseOption): DynamicModule {
    if (options.isTest) {
      return {
        module: DatabaseModule,
        imports: [
          TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'test',
            password: 'test1234',
            database: 'waggle_test',
            autoLoadEntities: true,
            synchronize: true,
            logging: false,
          }),
        ],
      };
    }
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get(`DB_HOST`),
            port: configService.get(`DB_PORT`),
            username: configService.get(`DB_USERNAME`),
            password: configService.get(`DB_PASSWORD`),
            database: configService.get(`DB_NAME`),
            autoLoadEntities: true,
            synchronize: configService.get('NODE_ENV') === 'development',
            logging: configService.get('NODE_ENV') === 'development',
          }),
        }),
      ],
    };
  }
}
