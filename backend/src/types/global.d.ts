export interface ShippingAddress {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface ProductAttributes {
  [key: string]: string | number | boolean;
  // Example: color: "White", width: 200, height: 80
}

// Product snapshot at the time of order
export interface ProductSnapshot {
  id: string;
  name: string;
  basePrice: number;
  attributes: ProductAttributes;
}

// Worker configuration (JSONB)
export interface WorkerConfig {
  [key: string]: any;
}
