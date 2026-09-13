import { useState, useEffect, useCallback } from 'react';
import { get, post, put, del } from '../api/client';
import { useCart } from '../context/CartContext';

export function useProducts(category) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshKey } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      const qs = params.toString();
      const data = await get(`/api/pos/products${qs ? `?${qs}` : ''}`);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshKey]);

  const createProduct = useCallback(async (data) => {
    return post('/api/pos/products', data);
  }, []);

  const updateProduct = useCallback(async (id, data) => {
    return put(`/api/pos/products/${id}`, data);
  }, []);

  const deleteProduct = useCallback(async (id) => {
    return del(`/api/pos/products/${id}`);
  }, []);

  return { products, loading, error, refetch: fetchProducts, createProduct, updateProduct, deleteProduct };
}
