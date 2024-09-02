import {
  BadRequestException,
  ConsoleLogger,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { User } from 'src/user/entities/user.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart.item.entity';
import { DataSource, getConnection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Merchandise } from 'src/merchandise/entities/merchandise.entity';
import { MerchandiseOption } from 'src/merchandise/entities/marchandise-option.entity';
import { stat } from 'fs';
import { query } from 'express';
import { HttpRequest } from 'aws-sdk';
import { catchError } from 'rxjs';
import { UpdateQuantity } from './types/update-quantity.type';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Merchandise)
    private readonly merchandisePostRepository: Repository<Merchandise>,
    @InjectRepository(MerchandiseOption)
    private readonly merchandiseOptionRepository: Repository<MerchandiseOption>,
    private dataSource: DataSource,
  ) {}

  // cartItem 장바구니 저장
  async create(createCartDto: CreateCartDto, userId: number) {
    const { merchandiseId, merchandiseOptionId, quantity } = createCartDto;

    //상품 유효성 체크
    const merchandise = await this.merchandisePostRepository.findOne({
      where: { merchandiseId },
    });

    // 상품 유효성 체크
    if (!merchandise) {
      throw new NotFoundException('상품이 존재하지 않습니다.');
    }

    //상품 옵션 가져오기
    const merchandiseOption = await this.merchandiseOptionRepository.findOne({
      where: { id: merchandiseOptionId },
      relations: ['merchandise'],
    });

    //상품 id 안에 있는 옵션 id가 맞는지 유효성 체크
    if (
      !merchandiseOption ||
      merchandiseOption.merchandise.merchandiseId !== merchandise.merchandiseId
    ) {
      throw new NotFoundException('해당 상품 내 옵션이 존재하지 않습니다.');
    }

    if (quantity <= 0) {
      throw new BadRequestException('수량을 입력해주세요');
    }
    console.log(
      '장바구니 추가 트랜잭션 시작--------------------------------------',
    );
    //트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      // 유저 추출 및 카트 유효성 검사
      const user = await queryRunner.manager.findOne(User, {
        where: { userId },
      });

      // 카트 데이터 조회
      let cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { userId } },
        relations: ['user'],
      });

      // 카트가 없다면 생성
      if (!cart) {
        cart = await queryRunner.manager.save(Cart, { user });
      }

      console.log('---------------장바구니생성완료------------');
      // 장바구니에 입력한 동일 상품 id && 옵션 id 있는지 확인
      const merchandiseCheck = await queryRunner.manager.findOne(CartItem, {
        where: {
          merchandise: { merchandiseId: createCartDto.merchandiseId },
          merchandiseOption: { id: createCartDto.merchandiseOptionId },
          cartId: cart.id,
        },
        relations: ['merchandise', 'merchandiseOption'],
      });

      // 있다면 수량만 추가  , 없다면 새로 카트에 저장
      let cartItem;
      if (merchandiseCheck) {
        merchandiseCheck.quantity += quantity; // 기존 수량에 추가
        cartItem = await queryRunner.manager.save(CartItem, merchandiseCheck);
      } else {
        cartItem = await queryRunner.manager.save(CartItem, {
          merchandiseId,
          merchandiseOption,
          quantity,
          cart,
        });
      }

      // 총 금액 합계
      const totalPrice = merchandise.price * cartItem.quantity;
      console.log('---------------장바구니추가완료------------');
      console.log(cartItem);

      await queryRunner.commitTransaction();
      return {
        status: HttpStatus.OK,
        message: '카트 저장에 성공했습니다.',
        data: {
          cartId: cart.id,
          merchandiseId: merchandise.merchandiseId,
          merchandiseName: merchandise.merchandiseName,
          merchandiseOptionId: cartItem.merchandiseOption.id,
          merchandiseOptionName: cartItem.merchandiseOption.optionName,
          quantity: cartItem.quantity,
          totalPrice,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 카트 전체 조회
  async findAll(userId: number) {
    // UserId로 갖고 있는 카트 조회
    const cart = await this.cartRepository.findOne({
      where: { user: { userId } },
    });

    if (!cart) {
      throw new NotFoundException('카트가 존재하지 않습니다.');
    }
    const cartItem = await this.cartItemRepository.find({
      where: { cart }, // cartId로 CartItem을 조회
      relations: ['merchandise', 'merchandiseOption'],
    });
    const cartItems = cartItem.map((cartItem) => ({
      cartItemId: cartItem.id,
      merchandiseId: cartItem.merchandise.merchandiseId,
      merchandiseName: cartItem.merchandise.merchandiseName,
      thumbnail: cartItem.merchandise.thumbnail,
      price: cartItem.merchandise.price,
      merchandiseOptionId: cartItem.merchandiseOption.id,
      merchandiseOptionName: cartItem.merchandiseOption.optionName,
      quantity: cartItem.quantity,
    }));

    return {
      status: HttpStatus.OK,
      message: '카트 전체 조회에 성공하셨습니다.',
      data: cartItems,
    };
  }

  async remove(userId: number, cartItemId: number) {
    // 회원의 경우 UserId로 갖고 있는 카트 조회
    const cart = await this.cartRepository.findOne({
      where: { user: { userId } },
    });
    if (!cart) {
      throw new NotFoundException('장바구니가 존재하지 않습니다.');
    }

    // 조회된 cart와 입력한 cartId를 통해 CartItem을 조회
    const cartItem = await this.cartItemRepository.findOne({
      where: { cart, id: cartItemId },
      relations: ['merchandise', 'merchandiseOption'],
    });

    if (!cartItem) {
      throw new NotFoundException('해당 상품은 장바구니에 존재하지 않습니다.');
    }
    console.log(cartItem);
    await this.cartItemRepository.delete({
      id: cartItemId,
    });

    return {
      status: HttpStatus.OK,
      message: '장바구니 상품 삭제에 성공하였습니다.',
      data: { cartItemId },
    };
  }

  async cartQuantity(
    userId: number,
    cartItemId: number,
    quantity: UpdateQuantity,
  ) {
    // 회원의 경우 UserId로 갖고 있는 카트 조회
    const cart = await this.cartRepository.findOne({
      where: { user: { userId } },
    });
    if (!cart) {
      throw new NotFoundException('장바구니가 존재하지 않습니다.');
    }
    console.log('-----------------');
    // 조회된 cart와 입력한 cartId를 통해 CartItem을 조회
    const cartItem = await this.cartItemRepository.findOne({
      where: { cart, id: cartItemId },
      relations: ['merchandise', 'merchandiseOption'],
    });

    if (!cartItem) {
      throw new NotFoundException('해당 상품은 장바구니에 존재하지 않습니다.');
    }
    console.log(cartItem);
    console.log(quantity);
    let updatedQuantity;
    if (quantity == UpdateQuantity.INCREMENT) {
      updatedQuantity = cartItem.quantity + 1;
    } else if (quantity == UpdateQuantity.DECREMENT) {
      updatedQuantity = cartItem.quantity - 1;
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '잘못된 경로입니다.',
      };
    }
    if (updatedQuantity == 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '최소 수량입니다.',
      };
    }
    await this.cartItemRepository.update(cartItemId, {
      quantity: updatedQuantity,
    });
    const updatedCartItem = await this.cartItemRepository.findOne({
      where: {
        id: cartItemId,
      },
      relations: ['merchandise', 'merchandiseOption'],
    });
    return {
      status: HttpStatus.OK,
      message: '장바구니 수정에 성공하였습니다.',
      data: { updatedCartItem },
    };
  }
}
