import { IsString, IsNotEmpty, IsBoolean, IsArray, IsObject, IsOptional } from 'class-validator';
import type { WorkerConfig } from '../../types/global';

export class CreateWorkerDto {
  @IsString()
  @IsNotEmpty()
  workerType: string; // email, webhook, inventory

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsArray()
  @IsString({ each: true })
  triggerStatuses: string[];

  @IsObject()
  config: WorkerConfig;
}
