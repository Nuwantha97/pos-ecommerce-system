import StatusBadge from '../../shared/StatusBadge';
import styles from './OrderDetail.module.css';

export default function OrderDetail({ order }) {
  if (!order) return null;

  const items = order.OrderItems || [];

  return (
    <div className={styles.container}>
      <div className={styles.metaRow}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Status:</span>
          <StatusBadge status={order.status} />
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Cart ID:</span>
          <span className={styles.metaValue}>{order.cart_id || '—'}</span>
        </div>
      </div>

      <table className={styles.itemsTable}>
        <thead>
          <tr>
            <th>Product</th>
            <th className={styles.numeric}>Quantity</th>
            <th className={styles.numeric}>Unit Price</th>
            <th className={styles.numeric}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles.emptyItems}>
                No items in this order.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const unitPrice = parseFloat(item.price_at_purchase || 0).toFixed(2);
              const subtotal = (
                parseFloat(item.price_at_purchase || 0) * (item.quantity || 1)
              ).toFixed(2);

              return (
                <tr key={item.id || item.product_id}>
                  <td className={styles.productName}>
                    {item.Product?.name || 'Product #' + item.product_id}
                  </td>
                  <td className={styles.numeric}>{item.quantity}</td>
                  <td className={styles.numeric}>${unitPrice}</td>
                  <td className={styles.numeric}>${subtotal}</td>
                </tr>
              );
            })
          )}
        </tbody>
        {items.length > 0 && order.total != null && (
          <tfoot>
            <tr>
              <td colSpan={3} className={styles.totalLabel}>
                Total
              </td>
              <td className={styles.totalValue}>
                ${parseFloat(order.total || 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
