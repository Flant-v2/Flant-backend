import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { User } from 'src/user/entities/user.entity';
import { CartItem } from './entities/cart.item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Merchandise } from 'src/merchandise/entities/merchandise.entity';
import { MerchandiseOption } from 'src/merchandise/entities/marchandise-option.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      User,
      Merchandise,
      MerchandiseOption,
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
