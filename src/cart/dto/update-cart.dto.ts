import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCartDto {
  @IsNotEmpty({ message: '수정할 상품 수량을 입력해주세요' })
  @IsNumber()
  quantity: number;
}
