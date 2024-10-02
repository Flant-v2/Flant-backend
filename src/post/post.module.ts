import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostImage } from './entities/post-image.entity';
import { User } from 'src/user/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { LikeModule } from 'src/like/like.module';
import { CommunityUserModule } from 'src/community/community-user/community-user.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostImage,
      User,
      CommunityUser,
      Comment,
    ]),
    LikeModule,
    CommunityUserModule,
    AdminModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
