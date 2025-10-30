import { ProductSnapshot } from '../../types/global';

export class OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  productSnapshot: ProductSnapshot;

  constructor(partial: Partial<OrderItem>) {
    Object.assign(this, partial);
  }
}
