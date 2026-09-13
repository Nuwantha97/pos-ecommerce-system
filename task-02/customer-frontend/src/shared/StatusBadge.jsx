import styles from './StatusBadge.module.css';

const STATUS_CLASS = {
  pending: styles.pending,
  reserved: styles.reserved,
  paid: styles.paid,
  success: styles.paid,
  failed: styles.failed,
  failure: styles.failed,
  expired: styles.expired,
  timeout: styles.expired,
  cancelled: styles.cancelled,
  refunded: styles.refunded,
};

export default function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status] || styles.pending}`}>
      {status}
    </span>
  );
}
