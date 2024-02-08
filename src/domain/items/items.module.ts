import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { Item } from './entities/item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCart } from './entities/item-cart.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, ItemCart, User])],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
