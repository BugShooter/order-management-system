import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderItem, OrderStatusTransition } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderStatusTransition])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
