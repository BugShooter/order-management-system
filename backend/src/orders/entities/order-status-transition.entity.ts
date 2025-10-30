export class OrderStatusTransition {
  id: string;
  fromStatus: string;
  toStatus: string;

  constructor(partial: Partial<OrderStatusTransition>) {
    Object.assign(this, partial);
  }
}
