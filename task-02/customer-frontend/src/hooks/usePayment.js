import { useState, useCallback } from 'react';
import { post } from '../api/client';

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const submitPayment = useCallback(async ({ orderId, idempotencyKey, forceOutcome }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await post('/api/shop/payments', { orderId, idempotencyKey, forceOutcome });
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { submitPayment, loading, error, result, reset };
}
