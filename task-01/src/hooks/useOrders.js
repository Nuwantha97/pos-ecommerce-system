import { useState, useEffect, useCallback } from 'react';
import { get, patch } from '../api/client';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get('/api/pos/orders');
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getOrder = useCallback(async (id) => {
    return get(`/api/pos/orders/${id}`);
  }, []);

  const cancelOrder = useCallback(async (id) => {
    return patch(`/api/pos/orders/${id}/cancel`);
  }, []);

  return { orders, loading, error, refetch: fetchOrders, getOrder, cancelOrder };
}
