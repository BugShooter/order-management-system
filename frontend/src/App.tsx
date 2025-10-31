import { useState } from 'react';
import { useProducts } from './hooks/useProducts';
import { Success } from './components/Success';
import { OrderForm } from './components/OrderForm';
import type { OrderResponse } from './schemas';
import './App.css';

function App() {
  const { products, isLoading, loadError } = useProducts();
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);

  if (isLoading) {
    return <div className="page-state-loading">Loading products...</div>;
  }

  if (loadError) {
    return (
      <div className="page-state-error">
        <h2>Error loading products</h2>
        <p>{loadError}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="page-state-error">
        <h2>No products available</h2>
      </div>
    );
  }

  // Show success page after order creation
  if (orderResponse) {
    return (
      <Success 
        order={orderResponse} 
        onCreateAnother={() => {
          setOrderResponse(null);
        }}
      />
    );
  }

  return (
    <div className="app-container">
      <h1>Order Management System</h1>
      <OrderForm 
        products={products} 
        onOrderCreated={(order) => setOrderResponse(order)} 
      />
    </div>
  );
}

export default App;
