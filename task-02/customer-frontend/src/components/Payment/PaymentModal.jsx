import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PaymentModal.module.css';
import { usePayment } from '../../hooks/usePayment';
import { useCart } from '../../context/CartContext';

export default function PaymentModal({ orderId, expiresAt, items, total, idempotencyKey, onClose }) {
  const { submitPayment, loading, error } = usePayment();
  const { triggerRefresh, clearCart } = useCart();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // 'idle', 'success', 'failed', 'expired'
  const [selectedOutcome, setSelectedOutcome] = useState('success');

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

  const handlePayment = async () => {
    try {
      await submitPayment({ orderId, idempotencyKey, forceOutcome: selectedOutcome });
      if (selectedOutcome === 'success') {
        clearCart();
        setStatus('success');
        triggerRefresh();
      } else if (selectedOutcome === 'failure') {
        setStatus('failed');
        triggerRefresh();
      } else if (selectedOutcome === 'timeout') {
        clearCart();
        setStatus('expired');
        triggerRefresh();
      }
    } catch {
      setStatus('failed');
    }
  };

  const handleRetry = () => {
    onClose();
  };

  const handleViewOrders = () => {
    onClose();
    navigate('/orders');
  };

  const isExpired = status === 'expired' || timeLeft <= 0;

  const renderContent = () => {
    if (status === 'success') {
      return (
        <div className={styles.resultState}>
          <div className={`${styles.iconCircle} ${styles.iconSuccess}`}>✓</div>
          <h2>Payment Successful</h2>
          <p>Order #{orderId} has been paid</p>
          <div className={styles.buttonGroup}>
            <button className={styles.btnAccent} onClick={handleViewOrders}>View Orders</button>
            <button className={styles.btnOutline} onClick={onClose}>Close</button>
          </div>
        </div>
      );
    }

    if (status === 'expired') {
      return (
        <div className={styles.resultState}>
          <div className={`${styles.iconCircle} ${styles.iconError}`}>✕</div>
          <h2>Reservation Expired</h2>
          <p>The stock reservation has been released. Please return to your cart and try again.</p>
          <button className={styles.btnOutline} onClick={() => {
            onClose();
            clearCart();
          }}>
            Start Over
          </button>
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
          <h2>Complete Payment</h2>
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
          <div className={styles.total}>Total: Rs.{typeof total === 'number' ? total.toFixed(2) : total}</div>
        </div>

        <div className={styles.controlsSection}>
          <p className={styles.controlLabel}>Simulate Payment Outcome:</p>
          <div className={styles.selectWrapper}>
            <select
              className={styles.outcomeSelect}
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              disabled={loading || isExpired}
            >
              <option value="success">Success</option>
              <option value="failure">Fail</option>
              <option value="timeout">Timeout</option>
            </select>
          </div>
          <button
            className={styles.processBtn}
            disabled={loading || isExpired}
            onClick={handlePayment}
          >
            {loading ? 'Processing...' : 'Process Payment'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.closeX}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        {renderContent()}
      </div>
    </div>
  );
}
