import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { OrderStatusTransition } from '../orders/entities/order-status-transition.entity';
import { WorkerConfiguration } from '../workers/entities/worker.entity';

export async function seed() {
  // Create DataSource
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected for seeding...');

  try {
    // Clear existing data
    await dataSource.getRepository(WorkerConfiguration).clear();
    await dataSource.getRepository(OrderStatusTransition).clear();
    await dataSource.getRepository(Product).clear();
    console.log('Existing data cleared.');

    // Seed Products
    const productRepository = dataSource.getRepository(Product);
    const products = [
      {
        name: 'White Table',
        basePrice: 499.99,
        stockQuantity: 15,
        attributes: {
          farbe: 'White',
          breite: 160,
          tiefe: 80,
          hoehe: 75,
          material: 'Wood',
        },
      },
      {
        name: 'Monitor 27" 4K',
        basePrice: 599.99,
        stockQuantity: 30,
        attributes: {
          groesse: 27,
          aufloesung: '3840x2160',
          panelTyp: 'IPS',
          refreshRate: 60,
        },
      },
    ];

    for (const productData of products) {
      const product = productRepository.create(productData);
      await productRepository.save(product);
    }
    console.log(`Seeded ${products.length} products`);

    // Seed Order Status Transitions (workflow)
    const transitionRepository = dataSource.getRepository(
      OrderStatusTransition,
    );
    const transitions = [
      { fromStatus: 'draft', toStatus: 'confirmed' },
      { fromStatus: 'confirmed', toStatus: 'processing' },
      { fromStatus: 'processing', toStatus: 'shipped' },
      { fromStatus: 'shipped', toStatus: 'delivered' },
      { fromStatus: 'draft', toStatus: 'cancelled' },
      { fromStatus: 'confirmed', toStatus: 'cancelled' },
      { fromStatus: 'processing', toStatus: 'cancelled' },
    ];

    for (const transitionData of transitions) {
      const transition = transitionRepository.create(transitionData);
      await transitionRepository.save(transition);
    }
    console.log(`Seeded ${transitions.length} status transitions`);

    // Seed Worker Configurations
    const workerRepository = dataSource.getRepository(WorkerConfiguration);
    const workers = [
      {
        workerType: 'email',
        name: 'Order Confirmation Email',
        enabled: true,
        triggerStatuses: ['confirmed'],
        config: {
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          from: 'orders@oms-system.com',
          templateId: 'order-confirmation',
        },
      },
      {
        workerType: 'email',
        name: 'Shipping Notification Email',
        enabled: true,
        triggerStatuses: ['shipped'],
        config: {
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          from: 'shipping@oms-system.com',
          templateId: 'shipping-notification',
        },
      },
      {
        workerType: 'webhook',
        name: 'Warehouse API Integration',
        enabled: true,
        triggerStatuses: ['confirmed', 'processing'],
        config: {
          url: 'https://warehouse.example.com/api/orders',
          method: 'POST',
          headers: {
            Authorization: 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        },
      },
      {
        workerType: 'inventory',
        name: 'Stock Reduction Service',
        enabled: true,
        triggerStatuses: ['confirmed'],
        config: {
          apiUrl: 'https://inventory.example.com/api/v1',
          apiKey: 'YOUR_INVENTORY_API_KEY',
          autoReserve: true,
        },
      },
      {
        workerType: 'webhook',
        name: 'Shipping Provider API',
        enabled: true,
        triggerStatuses: ['processing'],
        config: {
          url: 'https://shipping-provider.example.com/api/shipments',
          method: 'POST',
          headers: {
            'API-Key': 'YOUR_SHIPPING_API_KEY',
          },
        },
      },
    ];

    for (const workerData of workers) {
      const worker = workerRepository.create(workerData);
      await workerRepository.save(worker);
    }
    console.log(`Seeded ${workers.length} worker configurations`);

    console.log('\nDatabase seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run seed if executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seed script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed script failed:', error);
      process.exit(1);
    });
}
