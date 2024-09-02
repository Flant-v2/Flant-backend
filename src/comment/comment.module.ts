import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { LikeModule } from 'src/like/like.module';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommunityUser]), LikeModule],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
