import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../src/main';
import { DataSource } from 'typeorm';
import { Product } from '../src/products/entities/product.entity';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testProductId: string;

  beforeAll(async () => {
    // Use real app configuration from main.ts
    app = await createApp();
    await app.init();

    // Get DataSource to seed test data
    dataSource = app.get<DataSource>(DataSource);

    // Seed a test product
    const productRepo = dataSource.getRepository(Product);
    const testProduct = productRepo.create({
      name: 'E2E Test Product',
      basePrice: 99.99,
      stockQuantity: 100,
      attributes: { color: 'blue', size: 'large' },
    });
    const savedProduct = await productRepo.save(testProduct);
    testProductId = savedProduct.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    it('should successfully create an order (status 201)', () => {
      const validOrder = {
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        items: [
          {
            productId: testProductId,
            quantity: 2,
            price: 99.99,
          },
        ],
        shippingAddress: {
          street: 'Test Street 123',
          city: 'Berlin',
          zip: '10115',
          country: 'Germany',
        },
      };

      return request(app.getHttpServer())
        .post('/orders')
        .send(validOrder)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('customerId', validOrder.customerId);
          expect(res.body).toHaveProperty('status', 'draft');
          expect(res.body).toHaveProperty('total', 199.98); // 2 * 99.99
          expect(res.body).toHaveProperty('items');
          expect(res.body.items).toHaveLength(1);
          expect(res.body.shippingAddress).toEqual(validOrder.shippingAddress);
        });
    });

    it('should return 400 when items array is empty', () => {
      const invalidOrder = {
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        items: [], // Empty array
        shippingAddress: {
          street: 'Test Street 123',
          city: 'Berlin',
          zip: '10115',
          country: 'Germany',
        },
      };

      return request(app.getHttpServer())
        .post('/orders')
        .send(invalidOrder)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('statusCode', 400);
        });
    });

    it('should return 400 when customerId is not a valid UUID', () => {
      const invalidOrder = {
        customerId: 'invalid-uuid',
        items: [
          {
            productId: testProductId,
            quantity: 2,
            price: 99.99,
          },
        ],
        shippingAddress: {
          street: 'Test Street 123',
          city: 'Berlin',
          zip: '10115',
          country: 'Germany',
        },
      };

      return request(app.getHttpServer())
        .post('/orders')
        .send(invalidOrder)
        .expect(400);
    });

    it('should return 400 when shippingAddress is incomplete', () => {
      const invalidOrder = {
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        items: [
          {
            productId: testProductId,
            quantity: 2,
            price: 99.99,
          },
        ],
        shippingAddress: {
          street: 'Test Street 123',
          // Missing city, zip, country
        },
      };

      return request(app.getHttpServer())
        .post('/orders')
        .send(invalidOrder)
        .expect(400);
    });

    it('should return 400 when quantity is negative', () => {
      const invalidOrder = {
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        items: [
          {
            productId: testProductId,
            quantity: -1, // Negative quantity
            price: 99.99,
          },
        ],
        shippingAddress: {
          street: 'Test Street 123',
          city: 'Berlin',
          zip: '10115',
          country: 'Germany',
        },
      };

      return request(app.getHttpServer())
        .post('/orders')
        .send(invalidOrder)
        .expect(400);
    });

    it('should return 404 when product does not exist', () => {
      const orderWithInvalidProduct = {
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        items: [
          {
            productId: '00000000-0000-0000-0000-000000000000', // Non-existent product
            quantity: 1,
            price: 99.99,
          },
        ],
        shippingAddress: {
          street: 'Test Street 123',
          city: 'Berlin',
          zip: '10115',
          country: 'Germany',
        },
      };

      return request(app.getHttpServer())
        .post('/orders')
        .send(orderWithInvalidProduct)
        .expect(404);
    });
  });
});
