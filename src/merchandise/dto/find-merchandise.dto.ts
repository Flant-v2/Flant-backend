import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FindAllmerchandiseDto {
  /**
   * 제목
   * @example "title"
   */
  @IsOptional()
  @IsString()
  title?: string;
}

