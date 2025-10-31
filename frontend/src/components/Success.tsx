import type { OrderResponse } from '../schemas';

interface SuccessProps {
  order: OrderResponse;
  onCreateAnother: () => void;
}

export function Success({ order, onCreateAnother }: SuccessProps) {
  return (
      <div className="order-form-container">
        <h1>Order Created Successfully</h1>
      <div className="alert alert-success">
        <div className="success-content">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>
        <button 
            type="button" 
            onClick={onCreateAnother}
            className="success-button"
        >
            Create Another Order
        </button>
    </div>
  );
}
