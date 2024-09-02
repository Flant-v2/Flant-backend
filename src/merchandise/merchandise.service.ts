import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMerchandiseDto } from './dto/create-merchandise-post.dto';
import { Merchandise } from './entities/merchandise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { MerchandiseImage } from './entities/merchandise-image.entity';
import { MerchandiseOption } from './entities/marchandise-option.entity';
import { UpdateMerchandiseDto } from './dto/update-merchandise.dto';
import * as Flatted from 'flatted';
import { PartialUser } from 'src/user/interfaces/partial-user.entity';
import _ from 'lodash';
import { Community } from 'src/community/entities/community.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { MerchandiseCategory } from './entities/merchandise-category.entity';

@Injectable()
export class MerchandiseService {
  constructor(
    @InjectRepository(Merchandise)
    private readonly merchandiseRepository: Repository<Merchandise>,
    @InjectRepository(MerchandiseImage)
    private readonly merchandiseImageRepository: Repository<MerchandiseImage>,
    @InjectRepository(MerchandiseOption)
    private readonly merchandiseOptionRepository: Repository<MerchandiseOption>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(MerchandiseCategory)
    private readonly merchandiseCategoryRepository: Repository<MerchandiseCategory>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const { communityId, categoryName } = createCategoryDto;

    const community = await this.communityRepository.findOne({
      where: {
        communityId,
      },
    });

    if (_.isNil(community)) {
      throw new NotFoundException('해당 커뮤니티가 존재하지 않습니다.');
    }

    const category = await this.merchandiseCategoryRepository.save({
      communityId,
      categoryName,
    });

    return {
      status: HttpStatus.CREATED,
      message: '카테고리 생성이 완료되었습니다',
      data: {
        category,
      },
    };
  }

  // 카테고리 조회
  async findCategory(communityId: number) {
    const categories = await this.merchandiseCategoryRepository.find({
      where: {
        communityId,
      },
    });

    return {
      status: HttpStatus.OK,
      message: '카테고리 조회에 성공했습니다',
      data: {
        categories,
      },
    };
  }

  // 상품 생성 API
  async create(createMerchandiseDto: CreateMerchandiseDto, user: PartialUser) {
    const {
      communityId,
      merchandiseName,
      thumbnail,
      content,
      price,
      imageUrl,
      options,
      merchandiseCategoryId,
    } = createMerchandiseDto;

    const community = await this.communityRepository.findOne({
      where: {
        communityId,
      },
    });

    if (_.isNil(community)) {
      throw new NotFoundException('해당 커뮤니티가 존재하지 않습니다.');
    }

    const category = await this.merchandiseCategoryRepository.findOne({
      where: {
        merchandiseCategoryId,
      },
    });

    if (_.isNil(category)) {
      throw new NotFoundException('해당 카테고리가 존재하지 않습니다.');
    }

    // 상품 이름 중복 체크
    const merchandiseNameCheck = await this.merchandiseRepository.findOne({
      where: { merchandiseName: createMerchandiseDto.merchandiseName },
    });
    if (merchandiseNameCheck) {
      throw new BadRequestException('이미 존재하는 상품 이름입니다.');
    }

    // 생성
    const merchandise = this.merchandiseRepository.create({
      communityId,
      merchandiseName,
      thumbnail,
      content,
      price,
      merchandiseCategoryId,
    });
    const saveMerchandise = await this.merchandiseRepository.save(merchandise);

    //상품 생성 후 이미지 데이터 저장
    for (const url of imageUrl) {
      const saveImage = await this.merchandiseImageRepository.save({
        merchandiseId: merchandise.merchandiseId,
        url,
      });
    }

    //상품 생성 후 옵션 데이터 저장
    for (const option of options) {
      const saveOption = await this.merchandiseOptionRepository.save({
        merchandiseId: merchandise.merchandiseId,
        optionName: option,
      });
    }

    return {
      status: HttpStatus.CREATED,
      message: '상품 생성이 완료되었습니다',
      data: {
        communityId,
        merchandiseId: merchandise.merchandiseId,
        merchandiseName: merchandise.merchandiseName,
        thumbnail: merchandise.thumbnail,
        content: merchandise.content,
        price: merchandise.price,
        createdAt: merchandise.createdAt,
        updatedAt: merchandise.updatedAt,
        options,
      },
    };
  }

  // 상품 조회 API
  async findAll(communityId: number, merchandiseCategoryId: number) {
    //const { communityId, merchandiseCategoryId } = findAllmerchandiseDto;

    //salesName은 테스트용도 /  artist와 merchandiseCategoryId 업데이트 시 변경 예정
    const merchandises = await this.merchandiseRepository.find({
      where: {
        communityId,
        merchandiseCategory: {
          merchandiseCategoryId,
        },
      },
    });

    const data = merchandises.map((merchandise) => ({
      merchandiseId: merchandise.merchandiseId,
      communityId: merchandise.communityId,
      merchandiseName: merchandise.merchandiseName,
      merchandiseCategoryId: merchandise.merchandiseCategoryId,
      thumbnail: merchandise.thumbnail,
      price: merchandise.price,
      createdAt: merchandise.createdAt,
      updatedAt: merchandise.updatedAt,
    }));

    return {
      status: HttpStatus.OK,
      message: `상품 전체 조회가 완료되었습니다`,
      data,
    };
  }

  // 상품 상세 조회 API
  async findOne(merchandiseId: number) {
    // 상품 유효 체크
    const merchandise = await this.merchandiseRepository.findOne({
      where: { merchandiseId },
      relations: {
        merchandiseImage: true,
        merchandiseOption: true,
      },
    });

    if (!merchandise) {
      throw new NotFoundException('존재하지 않는 상품입니다.');
    }

    return {
      status: HttpStatus.OK,
      message: '상품 상세 조회에 성공하였습니다.',
      data: merchandise,
    };
  }

  // 상품 수정 API
  async update(
    merchandiseId: number,
    updateMerchandiseDto: UpdateMerchandiseDto,
    user: PartialUser,
  ) {
    const { merchandiseName, thumbnail, content, price, imageUrl, optionName } =
      updateMerchandiseDto;
    //상품 유효성 체크
    const merchandise = await this.merchandiseRepository.findOne({
      where: { merchandiseId },
      relations: {
        merchandiseImage: true,
        merchandiseOption: true,
      },
    });
    if (!merchandise) {
      throw new NotFoundException('존재하지 않는 상품입니다.');
    }

    const updatedMerchandise = await this.merchandiseRepository.update(
      {
        merchandiseId,
      },
      {
        merchandiseName,
        thumbnail,
        content,
        price,
      },
    );

    //이미지 입력경우
    if (imageUrl !== undefined) {
      // 기존 이미지 삭제
      await this.merchandiseImageRepository.delete({
        merchandiseId,
      });

      // 이미지 재생성
      await this.merchandiseImageRepository.save(
        imageUrl.map((url) => ({
          url,
          merchandiseId,
        })),
      );
    }

    if (optionName !== undefined) {
      // 기존 옵션 삭제
      console.log('---------');
      await this.merchandiseOptionRepository.delete({
        merchandiseId,
      });
      console.log('---');
      // 옵션 재생성
      await this.merchandiseOptionRepository.save(
        optionName.map((optionName, price) => ({
          optionName,
          merchandiseId,
        })),
      );
    }

    return {
      status: HttpStatus.OK,
      message: '수정 완료되었습니다.',
      updatedMerchandise,
      imageUrl,
      optionName,
    };
  }

  //상품 삭제 API
  async remove(merchandiseId: number, user: PartialUser) {
    const merchandise = await this.merchandiseRepository.findOne({
      where: { merchandiseId },
    });
    if (!merchandise) {
      throw new NotFoundException('존재하지 않는 상품입니다.');
    }

    await this.merchandiseRepository.softDelete({
      merchandiseId,
    });

    return {
      status: HttpStatus.OK,
      message: '상품 삭제에 성공하였습니다.',
      data: { merchandiseId },
    };
  }
}
