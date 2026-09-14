import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const isOutOfStock = !product.stock || product.stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  };

  const initialLetter = product.name ? product.name.charAt(0).toUpperCase() : '?';

  return (
    <Link to={`/products/${product.id}`} className={styles.card}>
      <div className={styles.imageArea}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder} aria-label={product.name}>
            {initialLetter}
          </div>
        )}

        {isOutOfStock && (
          <div className={styles.outOfStockOverlay}>
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name} title={product.name}>
          {product.name}
        </h3>
        <div className={styles.meta}>
          <span className={styles.price}>
            Rs.{parseFloat(product.price || 0).toFixed(2)}
          </span>
          <span className={styles.stock}>
            {product.stock ?? 0} in stock
          </span>
        </div>
        {!isOutOfStock && (
          <button
            type="button"
            className={styles.addBtn}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
}
