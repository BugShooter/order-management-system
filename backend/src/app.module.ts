import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // only for dev environment
      logging: true,
    }),
    OrdersModule,
    ProductsModule,
    WorkersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
