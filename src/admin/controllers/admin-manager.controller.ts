import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminManagerService } from '../services/admin-manager.service';
import { CreateManagerDto } from '../dto/create-manager.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user-role.type';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { MESSAGES } from 'src/constants/message.constant';

@ApiTags('어드민')
@ApiBearerAuth()
@Roles(UserRole.Admin)
@UseGuards(RolesGuard)
@Controller('v1/admin/managers')
export class AdminManagerController {
  constructor(private readonly adminManagerService: AdminManagerService) {}

  /**
   * 매니저 생성
   * @param CreateManagerDto
   */
  @Post()
  async createManager(@Body() createManagerDto: CreateManagerDto) {
    const data = await this.adminManagerService.createManager(createManagerDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: MESSAGES.MANAGER.CREATE,
      data,
    };
  }

  /**
   * 매니저 삭제
   * @param managerId
   */
  @Delete(':managerId')
  async deleteManager(@Param('managerId') managerId: number) {
    await this.adminManagerService.deleteManager(managerId);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.MANAGER.DELETE,
    };
  }
}
