import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/types/user-role.type';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserInfo } from 'src/util/decorators/user-info.decorator';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';
import { CommunityUserRoles } from 'src/auth/decorators/community-user-roles.decorator';
import { CommunityUserRole } from 'src/community/community-user/types/community-user-role.type';
import { CommunityUserGuard } from 'src/auth/guards/community-user.guard';

@ApiTags('Forms')
@Controller('v1/forms')
export class FormController {
  constructor(private readonly formService: FormService) {}

  /**
   * 폼 생성
   * @param createFormDto
   * @returns
   */
  @ApiBearerAuth()
  @CommunityUserRoles(CommunityUserRole.MANAGER)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  @Post()
  async create(
    @UserInfo() user: PartialUser,
    @Body() createFormDto: CreateFormDto,
  ) {
    return await this.formService.create(createFormDto, user);
  }

  /**
   * 폼 상세 조회
   * @param formId
   * @returns
   */
  @Get('/:formId')
  async findOne(@Param('formId', ParseIntPipe) formId: number) {
    return await this.formService.findOne(formId);
  }

  /**
   * 폼 수정
   * @param formId
   * @param updateFormDto
   * @returns
   */
  @ApiBearerAuth()
  @Patch('/:formId')
  @CommunityUserRoles(CommunityUserRole.MANAGER)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  async update(
    @Param('formId', ParseIntPipe) formId: number,
    @Body() updateFormDto: UpdateFormDto,
    @UserInfo() user: PartialUser,
  ) {
    return await this.formService.update(formId, updateFormDto, user);
  }

  /**
   * 폼 삭제
   * @param formId
   * @returns
   */
  @ApiBearerAuth()
  @Delete('/:formId')
  @CommunityUserRoles(CommunityUserRole.MANAGER)
  @UseGuards(JwtAuthGuard, CommunityUserGuard)
  async remove(
    @Param('formId', ParseIntPipe) formId: number,
    @UserInfo() user: PartialUser,
  ) {
    return await this.formService.remove(formId, user);
  }

  /**
   * 폼신청
   * @param formId
   * @param applyToFormDto
   * @param req
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/:formId')
  async applyForm(
    @Param('formId', ParseIntPipe) formId: number,
    @UserInfo() user: PartialUser,
  ) {
    return await this.formService.applyForm(user, formId);
  }
}
