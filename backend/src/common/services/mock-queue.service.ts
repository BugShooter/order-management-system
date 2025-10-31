import { Injectable, Logger } from '@nestjs/common';
import { IQueueService, OrderEvent } from '../interfaces/queue.interface';

@Injectable()
export class MockQueueService implements IQueueService {
  private readonly logger = new Logger(MockQueueService.name);
  private handlers: Map<string, Array<(event: OrderEvent) => Promise<void>>> =
    new Map();

  async publish(event: OrderEvent): Promise<void> {
    this.logger.log('Event published to queue:');
    this.logger.log(JSON.stringify(event, null, 2));

    // Simulate async processing
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Trigger subscribed handlers
    const eventHandlers = this.handlers.get(event.type) || [];
    for (const handler of eventHandlers) {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(`Error handling event ${event.type}:`, error);
      }
    }
  }

  subscribe(
    eventType: string,
    handler: (event: OrderEvent) => Promise<void>,
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    this.logger.log(`Subscribed to event: ${eventType}`);
  }
}
