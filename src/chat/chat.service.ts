import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUser } from './entities/chat-user.entity';
import { Repository } from 'typeorm';
import { CommunityUser } from 'src/community/community-user/entities/communityUser.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { Live } from 'src/live/entities/live.entity';

@Injectable()
export class ChatService {
  // 채팅 방을 저장할 객체
  constructor(
    @InjectRepository(ChatUser)
    private readonly chatUserRepository: Repository<ChatUser>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(CommunityUser)
    private readonly communityUserRepository: Repository<CommunityUser>,
    @InjectRepository(Live)
    private readonly liveRepository: Repository<Live>,
  ) {}

  // 새로운 채팅 방 생성
  async createRoom(liveId: number) {
    const existedRoom = await this.chatRoomRepository.findOne({ where: { liveId }})
    if(!existedRoom){
      const savedRoom = await this.chatRoomRepository.save({ liveId })
      return {
        status: HttpStatus.CREATED,
        message: `liveId_${liveId}의 채팅 방이 생성되었습니다.`,
        data: savedRoom.liveId,
      }
    } else {
      throw new ConflictException('이미 생성된 채팅 방이 존재합니다.')
    }
  }

  // 채팅 방에 사용자 추가
  async addUserToRoom(roomId: number, communityUserId: number) {
    const communityUserData = await this.communityUserRepository.findOne({ 
      where: { communityUserId: communityUserId }
    })
    const existedRoom = await this.chatRoomRepository.findOne({ 
      where: { chatRoomId: roomId }
    })
    if(!existedRoom){
      throw new NotFoundException('채팅 방을 찾을 수 없습니다.')
    }
    const joinedUser = await this.chatUserRepository.save({
      communityUserId: communityUserData.communityUserId,
      nickName: communityUserData.nickName,
    })

    return {
      status: HttpStatus.CREATED,
      message: '채팅 방 참여가 완료되었습니다.',
      data: joinedUser.nickName
    }
    
  }

  // 채팅 방에서 사용자 제거
  async removeUserFromRoom(roomId: number, communityUserId: number) {
    const existedRoom = await this.chatRoomRepository.findOne({ 
      where: { chatRoomId: roomId }
    })
    if(!existedRoom){
      throw new NotFoundException('채팅 방을 찾을 수 없습니다.')
    }
    const chatUserData = await this.chatUserRepository.findOne({
      where: { communityUserId : communityUserId }
    })
    if(!chatUserData){
      throw new NotFoundException('채팅 방에 없는 사용자입니다.')
    }
    await this.chatUserRepository.delete({ chatUserId: chatUserData.chatUserId })

    return {
      status: HttpStatus.OK,
      message: '퇴장 처리되었습니다.',
      data: {
        roomId: roomId,
        nickName: chatUserData.nickName
      }
    }
  }

  // 특정 방의 모든 사용자 가져오기
  async getUsers(roomId: number) {
    const allUsersInRoom = await this.chatRoomRepository.findOne({
      where: { chatRoomId: roomId },
      relations: ['chatUsers']
    })

    return {
      status: HttpStatus.OK,
      message: '모든 유저 정보를 가져왔습니다.',
      data: allUsersInRoom,
    }
  }

  // async updateRoomId(roomId: number, liveId: number){
  //   const existedLive = await this.liveRepository.findOne({ 
  //     where: { liveId: liveId }
  //   })
  //   if(!existedLive){
  //     throw new NotFoundException('라이브 정보를 찾을 수 없습니다.')
  //   }
  //   await this.liveRepository.update(
  //     { liveId: liveId },
  //     { chatRoomId: roomId }
  //   )
  //   const updatedData = await this.liveRepository.findOne({
  //     where: { liveId: liveId },
  //     select: ['chatRoomId']
  //   })
  //   return {
  //     status: HttpStatus.ACCEPTED,
  //     message: '채팅 방 아이디가 등록되었습니다.',
  //     data: {
  //       chatRoomId: updatedData
  //     }
  //   }
  // }
}

