import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatUser } from './entities/chat-user.entity';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { Live } from 'src/live/entities/live.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    ChatRoom, ChatUser, CommunityUser, Live
  ])],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
