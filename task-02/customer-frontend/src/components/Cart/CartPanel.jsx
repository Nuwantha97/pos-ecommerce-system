import { useState } from 'react';
import styles from './CartPanel.module.css';
import QuantityStepper from '../../shared/QuantityStepper';
import PaymentModal from '../Payment/PaymentModal';
import { useCart } from '../../context/CartContext';
import { useCheckout } from '../../hooks/useCheckout';

export default function CartPanel({ isOpen, onClose }) {
  const { items, cartId, customerId, total, clearCart, updateQuantity, removeItem } = useCart();
  const { checkout, loading: checkoutLoading, error: checkoutError, clearError } = useCheckout();
  const [paymentData, setPaymentData] = useState(null);

  const handleCheckout = async () => {
    clearError();
    const idempotencyKey = crypto.randomUUID();
    try {
      const payload = {
        cartId,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        customerId,
        idempotencyKey,
      };
      const result = await checkout(payload);
      if (result) {
        setPaymentData({
          orderId: result.orderId,
          expiresAt: result.expiresAt,
          items: [...items],
          total,
          idempotencyKey,
        });
        //clearCart();
        onClose();
      }
    } catch {
      // Error is handled by hook
    }
  };

  const handleCancel = () => {
    clearCart();
    onClose();
  };

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose}></div>}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2>Cart</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.itemsArea}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>Your cart is empty</div>
          ) : (
            <div className={styles.itemList}>
              {items.map(item => (
                <div key={item.productId} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemPrice}>Rs.{parseFloat(item.price).toFixed(2)}</div>
                  </div>
                  <div className={styles.itemActions}>
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(val) => updateQuantity(item.productId, val)}
                      min={1}
                    />
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.productId)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {checkoutError && <div className={styles.errorBox}>{checkoutError}</div>}
          <div className={styles.totalLine}>
            <span>Total</span>
            <span>Rs.{total.toFixed(2)}</span>
          </div>
          <div className={styles.footerButtons}>
            <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
            <button
              className={styles.checkoutBtn}
              onClick={handleCheckout}
              disabled={checkoutLoading || items.length === 0}
            >
              {checkoutLoading ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      </div>

      {paymentData && (
        <PaymentModal
          orderId={paymentData.orderId}
          expiresAt={paymentData.expiresAt}
          items={paymentData.items}
          total={paymentData.total}
          idempotencyKey={paymentData.idempotencyKey}
          onClose={() => setPaymentData(null)}
        />
      )}
    </>
  );
}
