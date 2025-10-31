import { useState, type FormEvent } from "react";
import type { Product, OrderResponse, } from "../schemas";
import { OrderFormSchema } from "../schemas";
import { FormField } from "./FormField";
import { createOrder } from "../api";

// Test customer ID
const TEST_CUSTOMER_ID = '550e8400-e29b-41d4-a716-446655440000';

interface OrderFormProps {
  products: Product[];
  onOrderCreated: (order: OrderResponse) => void;
}

export function OrderForm({ products, onOrderCreated }: OrderFormProps) {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Get first product for ordering
  const product = products[0];

  if (!product) {
    return (
      <div className="page-state-error">
        <h2>No products available</h2>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});
    
    if (!product) {
      setSubmitError('No products available');
      return;
    }

    // Validate with Zod
    const formData = {
      street,
      city,
      zip,
      country,
      productId: product.id,
      quantity,
    };

    const result = OrderFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        errors[issue.path[0] as string] = issue.message;
      });
      setFieldErrors(errors);
      setSubmitError('Please fix the errors in the form');
      return;
    }

    // Create order
    const orderData = {
      customerId: TEST_CUSTOMER_ID,
      shippingAddress: { street, city, zip, country },
      items: [{ productId: product.id, quantity, price: product.price }],
    };

    setIsSubmitting(true);

    createOrder(orderData)
      .then(validatedOrder => {
        onOrderCreated(validatedOrder);
        setStreet('');
        setCity('');
        setZip('');
        setCountry('');
        setQuantity(1);
      })
      .catch(err => {
        setSubmitError(err.message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="order-form-container">
      <h1>Create Order</h1>

      {/* Product Info at the top */}
      <div className="product-info">
        <h2>{product.name}</h2>
        <p className="price">Price: ${product.price.toFixed(2)}</p>
        <p className="stock">Available: {product.stock} in stock</p>
      </div>

      {submitError && (
        <div className="alert alert-error">
          <h2>Error</h2>
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Shipping Address</legend>
          <FormField
            label="Street *"
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            error={fieldErrors.street}
          />
          <div className="form-row">
            <FormField
              label="City *"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={fieldErrors.city}
            />
            <FormField
              label="Zip Code *"
              id="zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              error={fieldErrors.zip}
            />
          </div>
          <FormField
            label="Country *"
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            error={fieldErrors.country}
          />
        </fieldset>

        <fieldset>
          <legend>Quantity</legend>
          <FormField
            label="Quantity *"
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min={1}
            max={product.stock}
            error={fieldErrors.quantity}
            helpText={`Total: $${(product.price * quantity).toFixed(2)}`}
          />
        </fieldset>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Order...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
}
