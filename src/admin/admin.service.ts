import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminService {
  constructor( // Comment 엔티티에 대한 Repository 주입
  ) {}

  findAll(){
    return 'check this message'
  }
}