import { PickType } from '@nestjs/swagger';
import { Like } from '../entities/like.entity';

export class CreateLikeDto extends PickType(Like, ['status']) {}
