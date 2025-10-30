import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [OrdersModule, ProductsModule, WorkersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
