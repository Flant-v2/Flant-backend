// src/comments/comment.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommentCreationGuard } from 'src/auth/guards/comment-creation.guard';
import { UserInfo } from 'src/util/decorators/user-info.decorator';
import {
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LikeService } from 'src/like/like.service';
import { CreateLikeDto } from 'src/like/dto/create-like.dto';
import { ApiResponse } from 'src/util/api-response.interface';
import { Like } from 'src/like/entities/like.entity';
import { ItemType } from 'src/like/types/itemType.types';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';

@ApiTags('댓글')
@Controller('v1/comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly likeService: LikeService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, CommentCreationGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a comment (Membership or Artist Manager required)',
  })
  @ApiBody({ type: CreateCommentDto })
  async create(@Body() commentData: CreateCommentDto, @UserInfo() user: PartialUser): Promise<Comment> {
    console.log(user);
    console.log("----------000")
    return this.commentService.createComment(commentData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  async findAll(): Promise<Comment[]> {
    return this.commentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCommentDto })
  async update(
    @UserInfo() user: PartialUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() commentData: UpdateCommentDto,
  ): Promise<void> {
    return this.commentService.update(user, id, commentData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', type: Number })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @UserInfo() user: PartialUser,
  ) {
    return this.commentService.remove(user, id);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get comments by post ID' })
  async findCommentsByPost(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Comment[]> {
    return this.commentService.findCommentsByPost(postId);
  }

  @Post('reply/:commentId')
  @UseGuards(JwtAuthGuard, CommentCreationGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a reply (Membership or Artist Manager required)',
  })
  @ApiParam({ name: 'commentId', type: Number })
  @ApiBody({ type: CreateReplyDto })
  async createReply(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() replyData: CreateReplyDto,
  ): Promise<Comment> {
    const completeReplyData = {
      ...replyData,
      parentCommentId: commentId,
    };
    return this.commentService.createReply(completeReplyData);
  }

  @Put(':id/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update like status for a comment' })
  async updateLikeStatus(
    @UserInfo() user,
    @Param('id', ParseIntPipe) id: number,
    @Body() createLikeDto: CreateLikeDto,
  ): Promise<ApiResponse<Like>> {
    return this.likeService.updateLikeStatus(
      user.id,
      id,
      createLikeDto,
      ItemType.COMMENT,
    );
  }

  @Get(':id/likes')
  async countLikesOnComment(@Param('id', ParseIntPipe) id: number) {
    return this.likeService.countLikes(id, ItemType.COMMENT);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/likes/my')
  async checkIfUserLikedComment(
    @UserInfo() user: PartialUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.likeService.checkIfUserLiked(user.id, id, ItemType.COMMENT);
  }
}
