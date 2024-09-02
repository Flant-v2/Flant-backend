import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user-role.type';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optionaljwtauthguard ';
import { UserInfo } from 'src/util/decorators/user-info.decorator';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';
import { UpdateQuantity } from './types/update-quantity.type';

@ApiTags('카트 API')
@ApiBearerAuth()
@Controller('v1/carts')
@UseGuards(OptionalJwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * 카트 생성
   * @param createCartDto
   * @param req
   * @returns
   */
  @Roles(UserRole.User)
  @UseGuards(RolesGuard)
  @Post()
  async create(
    @Body() createCartDto: CreateCartDto,
    @UserInfo() user: PartialUser,
  ) {
    const data = await this.cartService.create(createCartDto, user.id);
    return data;
  }

  /**
   *
   * @returns 카트 전체 조회
   */
  @Roles(UserRole.User)
  @UseGuards(RolesGuard)
  @Get()
  async findAll(@UserInfo() user: PartialUser, @Res() res) {
    const data = await this.cartService.findAll(user.id);
    return res.json(data);
  }

  /**
   * 카트 아이템 삭제
   * @param cartItemId
   * @param req
   * @param res
   * @returns
   */
  @Roles(UserRole.User)
  @UseGuards(RolesGuard)
  @Delete('/items/:cartItemId')
  async remove(
    @Param('cartItemId') cartItemId: string,
    @UserInfo() user: PartialUser,
    @Res() res,
  ) {
    // 서비스 호출하여 로직 처리
    const data = await this.cartService.remove(user.id, +cartItemId);
    //반환
    return res.json(data);
  }

  /**
   * 상품 수량 수정
   * @param cartItemId
   * @param updateCadrDto
   * @param req
   * @param res
   * @returns
   */
  @Roles(UserRole.User)
  @UseGuards(RolesGuard)
  @Patch('/items/:cartItemId')
  async cartQuantity(
    @Param('cartItemId') cartItemId: string,
    @Query('quantity') quantity: UpdateQuantity,
    @UserInfo() user: PartialUser,
    @Res() res,
  ) {
    // 서비스 호출하여 로직 처리
    console.log({ quantity });
    const data = await this.cartService.cartQuantity(
      user.id,
      +cartItemId,
      quantity,
    );
    console.log({ quantity });
    return res.json(data);
  }
}
