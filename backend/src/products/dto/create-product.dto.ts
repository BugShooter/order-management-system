import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsObject,
  Min,
} from 'class-validator';
import type { ProductAttributes } from '../../types/global';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  basePrice: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsObject()
  attributes: ProductAttributes;
}
