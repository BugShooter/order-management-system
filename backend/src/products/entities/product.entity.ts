import { ProductAttributes } from '../../types/global';

export class Product {
  id: string;
  name: string;
  basePrice: number;
  stockQuantity: number;
  attributes: ProductAttributes;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Product>) {
    Object.assign(this, partial);
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();
  }
}
