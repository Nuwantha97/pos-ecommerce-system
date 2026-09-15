import { Fragment, useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useCart } from '../../context/CartContext';
import StatusBadge from '../../shared/StatusBadge';
import OrderDetail from './OrderDetail';
import styles from './OrderHistory.module.css';

const CANCELABLE_STATUSES = ['pending', 'reserved'];

export default function OrderHistory() {
  const { orders, loading, error, refetch, getOrder, cancelOrder } = useOrders();
  const { triggerRefresh } = useCart();

  const [expandedId, setExpandedId] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const handleRowClick = async (orderId) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      setOrderDetail(null);
      return;
    }

    setExpandedId(orderId);
    setOrderDetail(null);
    setDetailLoading(true);

    try {
      const data = await getOrder(orderId);
      setOrderDetail(data);
    } catch (err) {
      setActionError(err.message || 'Failed to load order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async (e, orderId) => {
    e.stopPropagation();
    setActionError(null);
    setCancellingId(orderId);

    try {
      await cancelOrder(orderId);
      triggerRefresh();
      await refetch();

      if (expandedId === orderId) {
        try {
          const updated = await getOrder(orderId);
          setOrderDetail(updated);
        } catch {
          // Keep current detail view if fetch fails
        }
      }
    } catch (err) {
      setActionError(err.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Order History</h1>
        <div className={styles.centerBox}>
          <div className={styles.spinner} />
          <p className={styles.stateText}>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Order History</h1>
        <div className={styles.errorBanner}>
          <p className={styles.errorText}>{error}</p>
          <button type="button" className={styles.retryBtn} onClick={refetch}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const orderList = Array.isArray(orders) ? orders : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Order History</h1>
      </div>

      {actionError && (
        <div className={styles.actionErrorBanner} role="alert">
          <span>{actionError}</span>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {orderList.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No orders found.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.expandHeader}></th>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created At</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((order) => {
                const isExpanded = expandedId === order.id;
                const isCancelling = cancellingId === order.id;
                const canCancel = CANCELABLE_STATUSES.includes(order.status);
                const itemsCount =
                  order.OrderItems?.length != null ? order.OrderItems.length : '—';
                const formattedDate = order.created_at
                  ? new Date(order.created_at).toLocaleString()
                  : '—';

                return (
                  <Fragment key={order.id}>
                    <tr
                      className={`${styles.orderRow} ${isExpanded ? styles.expandedRow : ''}`}
                      onClick={() => handleRowClick(order.id)}
                    >
                      <td className={styles.expandCell}>
                        <span className={styles.expandIcon}>
                          {isExpanded ? '▾' : '▸'}
                        </span>
                      </td>
                      <td className={styles.orderId}>#{order.id}</td>
                      <td>{itemsCount}</td>
                      <td className={styles.total}>
                        Rs.{parseFloat(order.total || 0).toFixed(2)}
                      </td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td className={styles.createdAt}>{formattedDate}</td>
                      <td className={styles.actionsCell}>
                        {canCancel && (
                          <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={(e) => handleCancel(e, order.id)}
                            disabled={isCancelling}
                            aria-label={`Cancel order #${order.id}`}
                          >
                            {isCancelling ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className={styles.detailRow}>
                        <td colSpan={7} className={styles.detailCell}>
                          {detailLoading ? (
                            <div className={styles.detailLoading}>
                              <div className={styles.miniSpinner} />
                              <span>Loading order details...</span>
                            </div>
                          ) : orderDetail ? (
                            <OrderDetail order={orderDetail} />
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
