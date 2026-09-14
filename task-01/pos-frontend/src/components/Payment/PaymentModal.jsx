import { useState, useEffect } from 'react';
import styles from './PaymentModal.module.css';
import { usePayment } from '../../hooks/usePayment';
import { useCart } from '../../context/CartContext';

export default function PaymentModal({ orderId, expiresAt, items, total, onClose }) {
  const { submitPayment, loading, error, result, reset } = usePayment();
  const { triggerRefresh } = useCart();
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [status, setStatus] = useState('idle'); // 'idle', 'success', 'failed', 'expired'
  
  const [timeLeft, setTimeLeft] = useState(() => {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (status === 'success') return;
    
    const interval = setInterval(() => {
      const newTimeLeft = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(newTimeLeft);
      if (newTimeLeft <= 0) {
        setStatus('expired');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, status]);

  const handlePayment = async (forceOutcome) => {
    try {
      await submitPayment({ orderId, idempotencyKey, forceOutcome });
      if (forceOutcome === 'success') {
        setStatus('success');
        triggerRefresh();
        setTimeout(onClose, 3000);
      } else if (forceOutcome === 'failure') {
        setStatus('failed');
        triggerRefresh();
      } else if (forceOutcome === 'timeout') {
        setStatus('expired');
        triggerRefresh();
      }
    } catch (err) {
      setStatus('failed');
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    reset();
  };

  const isExpired = status === 'expired' || timeLeft <= 0;

  const renderContent = () => {
    if (status === 'success') {
      return (
        <div className={styles.resultState}>
          <div className={`${styles.iconCircle} ${styles.iconSuccess}`}>✓</div>
          <h2>Payment Successful</h2>
          <p>Order #{orderId} has been paid</p>
          <button className={styles.btnOutline} onClick={onClose}>Close</button>
        </div>
      );
    }
    
    if (status === 'expired') {
      return (
        <div className={styles.resultState}>
          <div className={`${styles.iconCircle} ${styles.iconError}`}>✕</div>
          <h2>Reservation Expired</h2>
          <p>The stock reservation has been released.</p>
          <button className={styles.btnOutline} onClick={onClose}>Start Over</button>
        </div>
      );
    }
    
    if (status === 'failed') {
      return (
        <div className={styles.resultState}>
          <div className={`${styles.iconCircle} ${styles.iconError}`}>✕</div>
          <h2>Payment Failed</h2>
          <p>{error || 'An unknown error occurred.'}</p>
          <div className={styles.buttonGroup}>
            <button className={styles.btnAccent} onClick={handleRetry}>Retry Payment</button>
            <button className={styles.btnOutline} onClick={onClose}>Cancel</button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.defaultState}>
        <div className={styles.header}>
          <h2>Payment</h2>
        </div>
        
        <div className={`${styles.timer} ${timeLeft < 15 ? styles.timerRed : timeLeft < 60 ? styles.timerAmber : ''}`}>
          {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
        </div>

        <div className={styles.orderSummary}>
          <ul className={styles.itemList}>
            {items.map((item, idx) => (
              <li key={idx}>{item.quantity}x {item.name}</li>
            ))}
          </ul>
          <div className={styles.total}>Total: Rs.{total}</div>
        </div>

        <div className={styles.controlsSection}>
          <p className={styles.controlLabel}>Simulate Payment Outcome:</p>
          <div className={styles.simulationButtons}>
            <button 
              className={styles.successBtn} 
              disabled={loading || isExpired} 
              onClick={() => handlePayment('success')}
            >
              {loading ? 'Processing...' : 'Success'}
            </button>
            <button 
              className={styles.failBtn} 
              disabled={loading || isExpired} 
              onClick={() => handlePayment('failure')}
            >
              {loading ? 'Processing...' : 'Fail'}
            </button>
            <button 
              className={styles.timeoutBtn} 
              disabled={loading || isExpired} 
              onClick={() => handlePayment('timeout')}
            >
              {loading ? 'Processing...' : 'Timeout'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {renderContent()}
      </div>
    </div>
  );
}
