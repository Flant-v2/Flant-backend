import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChatUser } from './chat-user.entity';

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn({ unsigned: true })
  chatRoomId: number;
 
  @Column()
  liveId: number;

  @OneToMany(() => ChatUser, (chatUser) => chatUser.chatRoom)
  chatUsers: ChatUser[];
}