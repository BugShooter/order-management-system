import { Module, Global } from '@nestjs/common';
import { MockQueueService } from './services/mock-queue.service';

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
