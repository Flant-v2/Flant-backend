import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty({ message: '상품 ID를 입력해주세요' })
  @IsNumber()
  merchandiseId: number;

  @IsNotEmpty({ message: '상품 옵션 ID를 입력해주세요' })
  @IsNumber()
  merchandiseOptionId: number;

  @IsNotEmpty({ message: '상품 수량을 입력해주세요' })
  @IsNumber()
  quantity: number;
}
