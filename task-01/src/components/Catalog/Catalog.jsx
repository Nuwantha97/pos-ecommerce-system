import { useState, useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from './ProductCard';
import styles from './Catalog.module.css';

export default function Catalog() {
  const { products, loading, error, refetch } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');

  // Extract unique categories from products: 'All' always first, followed by sorted categories
  const categories = useMemo(() => {
    if (!products || products.length === 0) return ['All'];
    return [
      'All',
      ...new Set(products.map((p) => p.category).filter(Boolean)).values(),
    ].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)));
  }, [products]);

  // Client-side filter: if activeCategory !== 'All', filter products by category
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeCategory !== 'All') {
      return products.filter((p) => p.category === activeCategory);
    }
    return products;
  }, [products, activeCategory]);

  return (
    <div className={styles.catalog}>
      <h1 className={styles.title}>Catalog</h1>

      <div className={styles.categoryTabs} role="tablist" aria-label="Product categories">
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.categoryTab} ${isActive ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading products...</p>
        </div>
      )}

      {!loading && error && (
        <div className={styles.error}>
          <p>{error}</p>
          {refetch && (
            <button type="button" className={styles.retryBtn} onClick={refetch}>
              Retry
            </button>
          )}
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className={styles.empty}>
          <p>No products found in this category.</p>
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
