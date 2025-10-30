import { WorkerConfig } from '../../types/global';

export class WorkerConfiguration {
  id: string;
  workerType: string; // email, webhook, inventory
  name: string;
  enabled: boolean;
  triggerStatuses: string[]; // ['confirmed', 'shipped']
  config: WorkerConfig; 
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<WorkerConfiguration>) {
    Object.assign(this, partial);
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();
    this.enabled = this.enabled ?? true;
  }
}
