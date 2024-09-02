import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/util/decorators/user-info.decorator';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('order')
@ApiBearerAuth()
@Controller('v1/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 주문 생성
   * @param createOrderDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@UserInfo() user: PartialUser) {
    return await this.orderService.create(+user.id);
  }

  /**
   * 주문내역 전체 조회
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@UserInfo() user: PartialUser) {
    return this.orderService.findAll(user.id);
  }

  /**
   * 주문내역 상세조회
   * @param id
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @UserInfo() user: PartialUser) {
    return this.orderService.findOne(+id, user.id);
  }

  /**
   * 주문 취소 요청
   * @param id
   * @param updateOrderDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string) {
    return this.orderService.update(+id);
  }
}
