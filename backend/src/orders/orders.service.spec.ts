import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order, OrderItem } from './entities';
import { ProductsService } from '../products/products.service';
import type { IQueueService } from '../common';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: jest.Mocked<Repository<Order>>;
  let productsService: jest.Mocked<ProductsService>;
  let queueService: jest.Mocked<IQueueService>;

  const mockProduct = {
    id: 'product-123',
    name: 'Test Product',
    basePrice: 100,
    stockQuantity: 10,
    attributes: { color: 'red' },
  };

  const mockOrderDto: CreateOrderDto = {
    customerId: 'customer-123',
    items: [
      {
        productId: 'product-123',
        quantity: 2,
        price: 100,
      },
    ],
    shippingAddress: {
      street: 'Test Street 123',
      city: 'Berlin',
      zip: '10115',
      country: 'Germany',
    },
  };

  beforeEach(async () => {
    const mockOrderRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const mockOrderItemRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockProductsService = {
      findOne: jest.fn(),
    };

    const mockQueueService = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepo,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepo,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: 'IQueueService',
          useValue: mockQueueService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order));
    productsService = module.get(ProductsService);
    queueService = module.get('IQueueService');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an order', async () => {
      // Arrange
      const savedOrder = {
        id: 'order-123',
        customerId: mockOrderDto.customerId,
        status: 'draft',
        total: 200,
        shippingAddress: mockOrderDto.shippingAddress,
        items: [
          {
            id: 'item-123',
            productId: mockProduct.id,
            quantity: 2,
            price: 100,
            productSnapshot: {
              id: mockProduct.id,
              name: mockProduct.name,
              basePrice: mockProduct.basePrice,
              attributes: mockProduct.attributes,
            },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productsService.findOne.mockResolvedValue(mockProduct as any);
      orderRepository.create.mockReturnValue(savedOrder as any);
      orderRepository.save.mockResolvedValue(savedOrder as any);

      // Act
      const result = await service.create(mockOrderDto);

      // Assert
      expect(productsService.findOne).toHaveBeenCalledWith('product-123');
      expect(orderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: mockOrderDto.customerId,
          status: 'draft',
          total: 200,
          shippingAddress: mockOrderDto.shippingAddress,
        }),
      );
      expect(orderRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedOrder);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      // Arrange
      const productWithLowStock = {
        ...mockProduct,
        stockQuantity: 1, // Less than requested quantity (2)
      };

      productsService.findOne.mockResolvedValue(productWithLowStock as any);

      // Act & Assert
      await expect(service.create(mockOrderDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(mockOrderDto)).rejects.toThrow(
        'Insufficient stock for product Test Product. Available: 1',
      );
      expect(orderRepository.save).not.toHaveBeenCalled();
    });

    it('should calculate total correctly', async () => {
      // Arrange
      const orderWithMultipleItems: CreateOrderDto = {
        ...mockOrderDto,
        items: [
          { productId: 'product-123', quantity: 2, price: 100 },
          { productId: 'product-456', quantity: 3, price: 50 },
        ],
      };

      const mockProduct2 = {
        ...mockProduct,
        id: 'product-456',
        name: 'Product 2',
        basePrice: 50,
        stockQuantity: 20,
      };

      productsService.findOne
        .mockResolvedValueOnce(mockProduct as any)
        .mockResolvedValueOnce(mockProduct2 as any);

      orderRepository.create.mockImplementation(
        (dto: Partial<Order>) => dto as Order,
      );
      orderRepository.save.mockImplementation((order: any) =>
        Promise.resolve({ ...order, id: 'order-123' }),
      );

      // Act
      const result = await service.create(orderWithMultipleItems);

      // Assert
      expect(result.total).toBe(350); // (2 * 100) + (3 * 50) = 350
    });

    it('should publish event to queue after creating order', async () => {
      // Arrange
      const savedOrder = {
        id: 'order-123',
        customerId: mockOrderDto.customerId,
        status: 'draft',
        total: 200,
        shippingAddress: mockOrderDto.shippingAddress,
        items: [{ productId: 'product-123', quantity: 2 }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productsService.findOne.mockResolvedValue(mockProduct as any);
      orderRepository.create.mockReturnValue(savedOrder as any);
      orderRepository.save.mockResolvedValue(savedOrder as any);

      // Act
      await service.create(mockOrderDto);

      // Assert
      expect(queueService.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'order.created',
          orderId: 'order-123',
          timestamp: expect.any(Date) as Date,
          data: expect.objectContaining({
            order: savedOrder,
            customerId: mockOrderDto.customerId,
            total: 200,
            itemsCount: 1,
          }),
        }),
      );
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      productsService.findOne.mockRejectedValue(
        new NotFoundException('Product with ID product-123 not found'),
      );

      // Act & Assert
      await expect(service.create(mockOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(orderRepository.save).not.toHaveBeenCalled();
    });
  });
});
