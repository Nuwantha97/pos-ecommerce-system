import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import QuantityStepper from '../../shared/QuantityStepper';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [showActions, setShowActions] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = !product.stock || product.stock <= 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
    setQuantity(1);
    setShowActions(false);
  };

  const initialLetter = product.name ? product.name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`${styles.card} ${isOutOfStock ? styles.outOfStock : ''}`}
      onMouseEnter={() => {
        if (!isOutOfStock) {
          setShowActions(true);
        }
      }}
      onMouseLeave={() => {
        setShowActions(false);
      }}
    >
      <div className={styles.imageArea}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder} aria-label={product.name}>
            {initialLetter}
          </div>
        )}

        {isOutOfStock ? (
          <div className={styles.outOfStockOverlay}>
            <span className={styles.outOfStockText}>Out of Stock</span>
          </div>
        ) : (
          showActions && (
            <div className={styles.actionsOverlay}>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={Math.max(1, product.stock || 99)}
              />
              <button
                type="button"
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          )
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name} title={product.name}>
          {product.name}
        </h3>
        <div className={styles.row}>
          <span className={styles.price}>
            Rs.{parseFloat(product.price || 0).toFixed(2)}
          </span>
          <span className={styles.stock}>
            {product.stock ?? 0} in stock
          </span>
        </div>
      </div>
    </div>
  );
}
