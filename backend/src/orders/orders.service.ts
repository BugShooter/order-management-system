import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderItem } from './entities';
import { ProductsService } from '../products/products.service';
import type { IQueueService } from '../common';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly productsService: ProductsService,
    @Inject('IQueueService')
    private readonly queueService: IQueueService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate products exist and create snapshots
    const items: Partial<OrderItem>[] = [];
    let total = 0;

    for (const itemDto of createOrderDto.items) {
      const product = await this.productsService.findOne(itemDto.productId);

      if (product.stockQuantity < itemDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}`,
        );
      }

      const itemTotal = itemDto.price * itemDto.quantity;
      total += itemTotal;

      items.push({
        productId: product.id,
        quantity: itemDto.quantity,
        price: itemDto.price,
        productSnapshot: {
          id: product.id,
          name: product.name,
          basePrice: product.basePrice,
          attributes: product.attributes,
        },
      });
    }

    // Create order with items (cascade: true will automatically save items)
    const order = this.orderRepository.create({
      customerId: createOrderDto.customerId,
      shippingAddress: createOrderDto.shippingAddress,
      status: 'draft',
      total,
      items: items as OrderItem[],
    });

    const savedOrder = await this.orderRepository.save(order);

    // Publish event to queue
    await this.queueService.publish({
      type: 'order.created',
      orderId: savedOrder.id,
      timestamp: new Date(),
      data: {
        order: savedOrder,
        customerId: savedOrder.customerId,
        total: savedOrder.total,
        itemsCount: savedOrder.items.length,
      },
    });

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }
}
