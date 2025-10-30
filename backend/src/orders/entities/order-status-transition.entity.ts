import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('order_status_transitions')
export class OrderStatusTransition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromStatus: string;

  @Column()
  toStatus: string;
}
