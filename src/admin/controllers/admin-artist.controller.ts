import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminArtistService } from '../services/admin-artist.service';
import { CreateArtistDto } from '../dto/create-artist.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user-role.type';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { MESSAGES } from 'src/constants/message.constant';

@ApiTags('어드민')
@ApiBearerAuth()
@Roles(UserRole.Admin)
@UseGuards(RolesGuard)
@Controller('v1/admin/artists')
export class AdminArtistController {
  constructor(private readonly adminArtistService: AdminArtistService) {}

  /**
   * 아티스트 생성
   * @param CreateArtistDto
   */
  @Post()
  async createArtist(@Body() createArtistDto: CreateArtistDto) {
    const data = await this.adminArtistService.createArtist(createArtistDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: MESSAGES.ARTIST.CREATE,
      data,
    };
  }

  /**
   * 아티스트 삭제
   * @param artistId
   */

  @Delete(':artistId')
  async deleteArtist(@Param('artistId') artistId: number) {
    await this.adminArtistService.deleteArtist(artistId);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.ARTIST.DELETE,
    };
  }
}
