import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Comment, Post])],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}
