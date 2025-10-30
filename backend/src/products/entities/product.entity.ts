import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { ProductAttributes } from '../../types/global';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number;

  @Column('int', { default: 0 })
  stockQuantity: number;

  @Column('simple-json')
  attributes: ProductAttributes;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
