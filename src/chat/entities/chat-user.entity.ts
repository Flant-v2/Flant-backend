import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

import { ChatRoom } from './chat-room.entity';

@Entity('chat_users')
export class ChatUser {
  @PrimaryGeneratedColumn({ unsigned : true })
  chatUserId: number;
 
  @Column()
  communityUserId: number;

  @Column()
  nickName: string;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatUsers)
  @JoinColumn({ name: 'chat_room_id' })
  chatRoom: ChatRoom;
}