import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../context/CartContext';
import QuantityStepper from '../../shared/QuantityStepper';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { products, loading, error } = useProducts();
  const { addItem } = useCart();
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (productId, newQty) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: newQty,
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] ?? 1;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
    setQuantities((prev) => ({
      ...prev,
      [product.id]: 1,
    }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading products...</p>
        </div>
      )}

      {!loading && error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className={styles.empty}>
          No products found. Add products from the Products tab.
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isOutOfStock =
                  product.stock === 0 ||
                  (typeof product.stock === 'number' && product.stock <= 0);
                const quantity = quantities[product.id] ?? 1;

                return (
                  <tr
                    key={product.id}
                    className={`${styles.row} ${isOutOfStock ? styles.outOfStock : ''}`}
                  >
                    <td className={styles.nameCell}>{product.name}</td>
                    <td className={styles.categoryCell}>{product.category || '—'}</td>
                    <td className={styles.priceCell}>
                      Rs.{parseFloat(product.price || 0).toFixed(2)}
                    </td>
                    <td className={styles.stockCell}>{product.stock ?? 0}</td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actions}>
                        <QuantityStepper
                          value={quantity}
                          onChange={(newQty) => handleQuantityChange(product.id, newQty)}
                          min={1}
                          max={
                            isOutOfStock
                              ? 1
                              : product.stock > 0
                              ? product.stock
                              : 99
                          }
                        />
                        <button
                          type="button"
                          className={styles.addBtn}
                          disabled={isOutOfStock}
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
