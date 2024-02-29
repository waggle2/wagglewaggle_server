import { Module } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockUser } from './entities/block.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([BlockUser]), UsersModule],
  controllers: [BlocksController],
  providers: [BlocksService],
})
export class BlocksModule {}
