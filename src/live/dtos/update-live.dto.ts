import { IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateLiveDto {
    /**
     * 제목
     *  @example "수정 제목"
     */
    @IsOptional()
    @IsString()
    title?: string;
  
    /**
     * 썸네일이미지
     * @example "Form 수정 내용"
     */
    @IsOptional()
    @IsUrl()
    thumbnailImage?: string;
  
  }