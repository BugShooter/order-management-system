import { Module, Global } from '@nestjs/common';
import { MockQueueService } from './services/mock-queue.service';
import { IQueueService } from './interfaces/queue.interface';

@Global()
@Module({
  providers: [
    {
      provide: 'IQueueService',
      useClass: MockQueueService,
    },
  ],
  exports: ['IQueueService'],
})
export class CommonModule {}
