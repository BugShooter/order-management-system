# Order Management System - Backend

NestJS backend for Order Management System.

## Technologies

- **NestJS** - Framework
- **TypeScript** - Programming language
- **TypeORM** - ORM
- **SQLite** - Database (`database.sqlite` file)
- **class-validator** - DTO validation
- **Jest** - Testing

## Features

- REST API for order management
- Input validation
- Stock availability check
- Product snapshot on order creation
- Event publishing to queue (Mock Queue Service)
- Unit and E2E tests

## Setup
Install dependencies and seed the database.

```bash
npm install
npm run seed
```

Creates:
- demo products
- demo order status transitions
- demo worker configurations

## Running the app

### Development mode

```bash
npm run start:dev
```

Server starts at `http://localhost:3000`

### Production mode

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Orders

- `POST /orders` - Create order
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `PATCH /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

### Products

- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID

### Workers

- `GET /workers` - Get worker configurations

## Example Request

### Create Order

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "550e8400-e29b-41d4-a716-446655440000",
    "items": [
      {
        "productId": "<PRODUCT_ID>",
        "quantity": 2,
        "price": 499.99
      }
    ],
    "shippingAddress": {
      "street": "Hauptstrasse 123",
      "city": "Berlin",
      "zip": "10115",
      "country": "Germany"
    }
  }'
```

## Testing

### All tests

```bash
npm test
```

### Unit tests

```bash
npm test -- orders.service.spec.ts
```

### E2E tests

```bash
npm run test:e2e
```

### Test coverage

```bash
npm run test:cov
```

## Project Structure

```
src/
├── common/              # Shared modules (Queue Service)
├── orders/              # Orders module
│   ├── dto/            # Data Transfer Objects
│   ├── entities/       # TypeORM entities
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.service.spec.ts
├── products/            # Products module
├── workers/             # Workers module
├── types/               # TypeScript types
├── database/            # Seed scripts
└── main.ts              # Entry point

test/
└── orders.e2e-spec.ts   # E2E tests
```

## Validation

Backend automatically validates incoming data:

- UUID format for IDs
- Required fields
- At least 1 item in order
- Positive values for quantity and price
- Complete shipping address

## Events

After order creation, an event is published to the queue:

```json
{
  "type": "order.created",
  "orderId": "uuid",
  "timestamp": "2025-10-30T17:00:00Z",
  "data": {
    "order": {...},
    "customerId": "uuid",
    "total": 199.98,
    "itemsCount": 1
  }
}
```

## Development

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Build

```bash
npm run build
```
