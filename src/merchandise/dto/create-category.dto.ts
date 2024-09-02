import { PickType } from '@nestjs/swagger';
import { MerchandiseCategory } from '../entities/merchandise-category.entity';

export class CreateCategoryDto extends PickType(MerchandiseCategory, [
  'categoryName', 'communityId' 
]) {}
