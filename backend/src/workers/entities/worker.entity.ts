import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { WorkerConfig } from '../../types/global';

@Entity('worker_configurations')
export class WorkerConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workerType: string; // email, webhook, inventory

  @Column()
  name: string;

  @Column({ default: true })
  enabled: boolean;

  @Column('simple-array')
  triggerStatuses: string[]; // ['confirmed', 'shipped']

  @Column('simple-json')
  config: WorkerConfig;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
