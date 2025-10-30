import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { WorkerConfiguration } from './entities';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(WorkerConfiguration)
    private readonly workerRepository: Repository<WorkerConfiguration>,
  ) {}

  async create(createWorkerDto: CreateWorkerDto): Promise<WorkerConfiguration> {
    const worker = this.workerRepository.create(createWorkerDto);
    return await this.workerRepository.save(worker);
  }

  async findAll(): Promise<WorkerConfiguration[]> {
    return await this.workerRepository.find();
  }

  async findOne(id: string): Promise<WorkerConfiguration> {
    const worker = await this.workerRepository.findOne({ where: { id } });
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    return worker;
  }

  async update(id: string, updateWorkerDto: UpdateWorkerDto): Promise<WorkerConfiguration> {
    const worker = await this.findOne(id);
    Object.assign(worker, updateWorkerDto);
    return await this.workerRepository.save(worker);
  }

  async remove(id: string): Promise<void> {
    const worker = await this.findOne(id);
    await this.workerRepository.remove(worker);
  }
}
