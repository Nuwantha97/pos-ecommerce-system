import { useState, useCallback } from 'react';
import { post } from '../api/client';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkout = useCallback(async ({ cartId, items, idempotencyKey }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await post('/api/pos/checkout', { cartId, items, idempotencyKey });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { checkout, loading, error, clearError };
}
