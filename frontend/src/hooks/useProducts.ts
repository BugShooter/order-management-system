import { useState, useEffect } from 'react';
import { fetchProducts } from '../api';
import type { Product } from '../schemas';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchProducts()
      .then(validatedProducts => {
        setProducts(validatedProducts);
        setIsLoading(false);
      })
      .catch(err => {
        setLoadError(err.message);
        setIsLoading(false);
      });
  }, []);

  return { products, isLoading, loadError };
}
