import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UploadedFiles,
  Put,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateLikeDto } from 'src/like/dto/create-like.dto';
import { ApiResponse } from 'src/util/api-response.interface';
import { Like } from 'src/like/entities/like.entity';
import { ItemType } from 'src/like/types/itemType.types';
import { LikeService } from 'src/like/like.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiFiles } from 'src/util/decorators/api-file.decorator';
import { UserInfo } from 'src/util/decorators/user-info.decorator';
import { postImageUploadFactory } from 'src/util/image-upload/create-s3-storage';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CreateCommentDto } from 'src/comment/dto/create-comment.dto';
import { CommunityUserGuard } from 'src/auth/guards/community-user.guard';

@ApiTags('게시물')
@Controller('v1/posts')
// @UseInterceptors(CacheInterceptor)
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly likeService: LikeService,
  ) {}

  /**
   * 게시글 작성
   * @param files
   * @param req
   * @param communityId
   * @param createPostDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiFiles('postImage', 3, postImageUploadFactory())
  @Post()
  async create(
    @UploadedFiles() files: { postImage?: Express.MulterS3.File[] },
    @UserInfo() user: PartialUser,
    @Body() createPostDto,
  ) {
    let imageUrl = undefined;
    if (files && files.postImage && files.postImage.length > 0) {
      const imageLocation = files.postImage.map((file) => file.location);
      imageUrl = imageLocation;
    }
    const userId = user.id;
    return await this.postService.create(+userId, createPostDto, imageUrl);
  }

  /**
   * 게시물 전체 조회(권한 불필요)
   * @param artistId
   * @param communityId
   * @returns
   */
  @Get()
  @ApiQuery({ name: 'isArtist', required: false, type: Boolean })
  @ApiQuery({ name: 'communityId', required: true, type: Number })
  async findPosts(
    @Query('isArtist') isArtist: boolean,
    @Query('communityId') communityId: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.postService.getCachedData(isArtist, +communityId);
  }

  /**
   * 게시물 상세 조회(권한 불필요)
   * @param postId
   * @returns
   */
  @Get(':postId')
  async findOne(@Param('postId') postId: number) {
    return await this.postService.findOne(+postId);
  }

  /**
   * 게시물 수정
   * @param req
   * @param postId
   * @param updatePostDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiFiles('postImage', 3, postImageUploadFactory())
  @Patch(':postId')
  async update(
    @UploadedFiles() files: { postImage?: Express.MulterS3.File[] },
    @UserInfo() user: PartialUser,
    @Param('postId') postId: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    let imageUrl = undefined;
    if (files && files.postImage && files.postImage.length > 0) {
      const imageLocation = files.postImage.map((file) => file.location);
      imageUrl = imageLocation;
    }
    const userId = user.id;
    return await this.postService.update(
      +userId,
      +postId,
      updatePostDto,
      imageUrl,
    );
  }

  /**
   * 게시물 삭제
   * @param req
   * @param postId
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  async remove(@UserInfo() user: PartialUser, @Param('postId') postId: number) {
    return await this.postService.remove(user, +postId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/likes')
  async updateLikeStatus(
    @UserInfo() user: PartialUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() createLikeDto: CreateLikeDto,
  ): Promise<ApiResponse<Like>> {
    return this.likeService.updateLikeStatus(
      user.id,
      id,
      createLikeDto,
      ItemType.POST,
    );
  }

  @Get(':id/likes')
  async countLikesOnPost(@Param('id', ParseIntPipe) id: number) {
    return this.likeService.countLikes(id, ItemType.POST);
  }

  /**
   * 게시글 좋아요 확인
   * @param user
   * @param id
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/likes/my')
  async checkIfUserLikedPost(
    @UserInfo() user: PartialUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.likeService.checkIfUserLiked(user.id, id, ItemType.POST);
  }

  @Post('/:postId/comments')
  @ApiOperation({ summary: 'Get comments by post ID' })
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  async createCommentByPost(
    @Body() createCommentDto: CreateCommentDto,
    @UserInfo() user: PartialUser,
    @Param('postId', ParseIntPipe)
    postId: number,
  ) {
    return await this.postService.createCommentByPost(
      postId,
      user,
      createCommentDto,
    );
  }

  @Get('/:postId/comments')
  @ApiOperation({ summary: 'Get comments by post ID' })
  // @UseGuards(JwtAuthGuard)
  async findCommentsByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('isArtist') isArtist?: boolean,
  ) {
    return await this.postService.findCommentsByPost(postId, isArtist ?? false);
  }
}
