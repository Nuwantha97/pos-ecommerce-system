import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get } from '../../api/client';
import { useCart } from '../../context/CartContext';
import QuantityStepper from '../../shared/QuantityStepper';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, refreshKey } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    get(`/api/shop/products/${id}`)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, refreshKey]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
    setAddedFeedback(true);
    setQuantity(1);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button type="button" className={styles.retryBtn} onClick={() => navigate(0)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = !product.stock || product.stock <= 0;
  const initialLetter = product.name ? product.name.charAt(0).toUpperCase() : '?';

  return (
    <div className={styles.container}>
      <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className={styles.content}>
        <div className={styles.imageArea}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className={styles.image} />
          ) : (
            <div className={styles.placeholder}>{initialLetter}</div>
          )}
        </div>

        <div className={styles.details}>
          <h1 className={styles.name}>{product.name}</h1>

          {product.category && (
            <span className={styles.category}>{product.category}</span>
          )}

          <div className={styles.price}>
            Rs.{parseFloat(product.price || 0).toFixed(2)}
          </div>

          <div className={styles.stockInfo}>
            {isOutOfStock ? (
              <span className={styles.stockOutOfStock}>Out of Stock</span>
            ) : (
              <span className={styles.stockInStock}>{product.stock} in stock</span>
            )}
          </div>

          {isOutOfStock ? (
            <div className={styles.outOfStockLabel}>Out of Stock</div>
          ) : (
            <div className={styles.actions}>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={product.stock || 99}
              />
              <button
                type="button"
                className={`${styles.addToCartBtn} ${addedFeedback ? styles.addedBtn : ''}`}
                onClick={handleAddToCart}
              >
                {addedFeedback ? 'Added ✓' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
