import {
  BadRequestException,
  ConsoleLogger,
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';
import { Order } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart.item.entity';
import { OrderItem } from './entities/orderItem.entity';
import { Merchandise } from 'src/merchandise/entities/merchandise.entity';
import { MerchandiseOption } from 'src/merchandise/entities/marchandise-option.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Merchandise)
    private readonly merchandiseRepository: Repository<Merchandise>,
    @InjectRepository(MerchandiseOption)
    private readonly merchandiseOption: Repository<MerchandiseOption>,
    private dataSource: DataSource,
  ) {}

  async create(userId: number) {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: ['cart'],
    });

    if (user.cart === null) {
      throw new NotAcceptableException('카트가 존재하지 않습니다.');
    }

    //카트 아이템 데이터 가져오기
    const cartItem = await this.cartItemRepository.find({
      where: { cart: user.cart }, // cartId로 CartItem을 조회
      relations: ['merchandise', 'merchandiseOption'],
    });

    //트랜잭션 처리
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // 각 상품의 옵션별 가격 + 배송비 합산을 계산, 새로은 Map을 만들어 저장
      const plusMerchandisePosts = new Map();
      let totalPrice = 0;

    cartItem.forEach((item) => {
      const merchandisePostId = item.merchandise.merchandiseId;

      // // 상품 id 당 배달비는 1번만 계산
      // if (!plusMerchandisePosts.has(merchandisePostId)) {
      //   totalPrice += item.merchandise.deliveryPrice;
      //   plusMerchandisePosts.set(merchandisePostId, {});
      // }

      // 옵션 * 수량 가격 추가
      if (item.merchandiseOption) {
        totalPrice += item.merchandise.price * item.quantity;
      }
    });

      //order 생성
      const order = await queryRunner.manager.save(Order, { totalPrice, user });

    let orderItems = cartItem.map((item) => ({
      order: order, // 이미 저장된 주문
      merchandisePostId: item.merchandise.merchandiseId,
      merchandiseOption: item.merchandiseOption.merchandiseId,
      quantity: item.quantity,
    }));

      // 생성된  OrderItem 저장
      await queryRunner.manager.save(OrderItem, orderItems);

      //포인트 부족 시 오류 반환
      if (user.point < totalPrice) {
        throw new BadRequestException('포인트가 부족합니다.');
      }

      //유저 포인트에서 합산 금액 차감
      user.point -= totalPrice;
      await queryRunner.manager.save(user);

      //기존 카트 삭제
      await queryRunner.manager.delete(Cart, user.cart.id);
      await queryRunner.commitTransaction();
      return {
        status: HttpStatus.CREATED,
        message: '주문이 완료되었습니다.',
        data: {
          orderId: order.id,
          totalPrice: order.totalPrice,
          process: order.progress,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  //주문 전체 조회
  async findAll(userId: number) {
    const data = await this.orderRepository.find({
      where: { user: { userId } },
    });

    return {
      status: HttpStatus.OK,
      message: '주문내역 조회에 성공하였습니다.',
      data,
    };
  }

  //주문 상세 조회
  async findOne(id: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: { id, user: { userId } },
      relations: ['orderItem'],
    });
    if (!order) {
      throw new NotFoundException('주문이 존재하지 않습니다.');
    }

    const merchandise = await this.merchandiseRepository.findOne({
      where: { merchandiseId: order.orderItem[0].merchandisePostId },
      relations: ['merchandiseOption'],
    });
    return {
      status: HttpStatus.OK,
      message: '주문내역 상세 조회에 성공하였습니다.',
      data: {
        orderId: order.id,
        progress: order.progress,
        orderItem: order.orderItem,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    };
  }

  // 주문 취소
  async update(id: number) {
    const data = await this.orderRepository.findOne({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('주문이 존재하지 않습니다.');
    }

    //주문 상태에 따라 불가능한 로직 추가 필요
    // if (data.progress == 'deliveryFinish') {
    //   throw new NotFoundException('배송이 완료된 주문입니다.');
    // }
    // if (data.progress == 'ready') {
    //   throw new NotFoundException('주문 취소가 불가능합니다.');
    // }

    // 주문 취소 요청 시 어디로 요청이 가야하지?
    // 취소가 완료 시 point도 재지급 되어야 함 / api 추가 ? or 다른방법?

    return {
      statsu: HttpStatus.OK,
      message: ' 주문 취소 요청이 되었습니다',
      orderId: data.id,
    };
  }
}
