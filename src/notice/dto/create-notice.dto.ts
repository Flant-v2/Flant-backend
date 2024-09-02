import { PickType } from "@nestjs/swagger";
import { Notice } from "../entities/notice.entity";

export class CreateNoticeDto extends PickType(Notice, ['title', 'content', 'communityId']) {}
