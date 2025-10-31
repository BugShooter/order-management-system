export interface OrderEvent {
  type:
    | 'order.created'
    | 'order.status_changed'
    | 'order.updated'
    | 'order.cancelled';
  orderId: string;
  timestamp: Date;
  data: any;
}

export interface IQueueService {
  /**
   * Publish event to queue
   */
  publish(event: OrderEvent): Promise<void>;

  /**
   * Subscribe to events (for workers)
   */
  subscribe(
    eventType: string,
    handler: (event: OrderEvent) => Promise<void>,
  ): void;
}
