import { useState, useEffect, useCallback } from 'react';
import { get } from '../api/client';
import { useCart } from '../context/CartContext';

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshKey } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category && filters.category !== 'All') params.set('category', filters.category);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      const qs = params.toString();
      const data = await get(`/api/shop/products${qs ? `?${qs}` : ''}`);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.category, filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshKey]);

  const getProduct = useCallback(async (id) => {
    return get(`/api/shop/products/${id}`);
  }, []);

  return { products, loading, error, refetch: fetchProducts, getProduct };
}
