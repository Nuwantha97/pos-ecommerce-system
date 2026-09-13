import { useState, useEffect, useCallback } from 'react';
import { get, patch, post } from '../api/client';

export function useOrders(customerId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await get(`/api/shop/orders?customerId=${customerId}`);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getOrder = useCallback(async (id) => {
    return get(`/api/shop/orders/${id}`);
  }, []);

  const cancelOrder = useCallback(async (id) => {
    return patch(`/api/shop/orders/${id}/cancel`);
  }, []);

  const refundOrder = useCallback(async (id) => {
    return post(`/api/shop/orders/${id}/refund`);
  }, []);

  return { orders, loading, error, refetch: fetchOrders, getOrder, cancelOrder, refundOrder };
}
