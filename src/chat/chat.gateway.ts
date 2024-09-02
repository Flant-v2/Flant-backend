import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

const userList = {}

@WebSocketGateway({ namespace: '/api/v1/chat', transports: ['websocket'] })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}
  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    delete userList[client.id]
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string, nickName: string },
    @ConnectedSocket() client: Socket,
  ) {
    userList[client.id] = data.nickName
    client.join(data.roomId);
    client.emit('joinedRoom', data.roomId, userList);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string, communityUserId },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.roomId);
    client.emit('leftRoom', data.roomId);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
  @MessageBody() message: { roomId: string, nickName: string, text: string },
  @ConnectedSocket() client: Socket,
) {
  console.log(`Received message: ${message.text} from client: ${client.id}`);
  // 채팅방 내 다른 클라이언트에게 메시지를 브로드캐스트
  this.server.to(message.roomId).emit('receiveMessage', {
    clientId: client.id,
    nickName: message.nickName,
    text: message.text,
  });
 }
}
