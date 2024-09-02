import { Module } from '@nestjs/common';
import { MerchandiseService } from './merchandise.service';
import { MerchandiseController } from './merchandise.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchandiseImage } from './entities/merchandise-image.entity';
import { MerchandiseOption } from './entities/marchandise-option.entity';
import { Merchandise } from './entities/merchandise.entity';
import { Manager } from 'src/admin/entities/manager.entity';
import { User } from 'src/user/entities/user.entity';
import { CommunityUserModule } from 'src/community/community-user/community-user.module';
import { AdminModule } from 'src/admin/admin.module';
import { MerchandiseCategory } from './entities/merchandise-category.entity';
import { Community } from 'src/community/entities/community.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MerchandiseCategory,
      MerchandiseImage,
      MerchandiseOption,
      Merchandise,
      Manager,
      User,
      Community
    ]),

    CommunityUserModule,
    AdminModule,
  ],

  controllers: [MerchandiseController],
  providers: [MerchandiseService],
})
export class MerchandiseModule {}
