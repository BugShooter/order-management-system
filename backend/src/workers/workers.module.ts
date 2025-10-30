import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkersService } from './workers.service';
import { WorkersController } from './workers.controller';
import { WorkerConfiguration } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([WorkerConfiguration])],
  controllers: [WorkersController],
  providers: [WorkersService],
  exports: [WorkersService],
})
export class WorkersModule {}
