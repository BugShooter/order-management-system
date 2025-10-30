import { ShippingAddress } from '../../types/global';

export class Order {
  id: string;
  customerId: string;
  status: string;
  total: number;
  shippingAddress: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Order>) {
    Object.assign(this, partial);
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();
  }
}
