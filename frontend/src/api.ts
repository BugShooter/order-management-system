import { ProductsArraySchema, OrderResponseSchema } from './schemas';
import type { Product, OrderResponse } from './schemas';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// API functions
export const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return ProductsArraySchema.parse(data);
};
    
export const createOrder = async (orderData: {
  customerId: string;
  shippingAddress: { street: string; city: string; zip: string; country: string };
  items: { productId: string; quantity: number; price: number }[];
}): Promise<OrderResponse> => {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create order');
  }
  
  const data = await res.json();
  return OrderResponseSchema.parse(data);
};
