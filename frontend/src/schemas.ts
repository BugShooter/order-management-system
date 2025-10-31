import { z } from 'zod';

// Backend product schema
export const BackendProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  basePrice: z.number().positive(),
  stockQuantity: z.number().int().nonnegative(),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

// Frontend product schema (transformed)
export const ProductsArraySchema = z.array(BackendProductSchema).transform((products) =>
  products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.basePrice,
    stock: p.stockQuantity,
  }))
);

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

// Order response schema
export const OrderResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  createdAt: z.string(),
});

export type OrderResponse = z.infer<typeof OrderResponseSchema>;

// Client-side order form schema for validation
export const OrderFormSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  zip: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  productId: z.string().uuid('Please select a product'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export type OrderFormData = z.infer<typeof OrderFormSchema>;
