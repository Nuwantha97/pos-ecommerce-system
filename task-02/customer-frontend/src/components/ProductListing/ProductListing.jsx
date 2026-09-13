import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from './ProductCard';
import styles from './ProductListing.module.css';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [searchInput, setSearchInput] = useState(search);

  /* Debounce search input → URL param */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (searchInput) next.set('search', searchInput);
        else next.delete('search');
        return next;
      }, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  /* Sync URL → input when navigating back */
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const { products, loading, error, refetch } = useProducts({ search, category, minPrice, maxPrice });

  /* Extract categories from product list */
  const categories = useMemo(() => {
    if (!products || products.length === 0) return ['All'];
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['All', ...cats.sort()];
  }, [products]);

  const updateParam = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value && value !== 'All') next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  };

  return (
    <div className={styles.listing}>
      <h1 className={styles.title}>Products</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className={styles.filters}>
        <div className={styles.categoryTabs} role="tablist" aria-label="Product categories">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={cat === category}
              className={`${styles.categoryTab} ${cat === category ? styles.activeTab : ''}`}
              onClick={() => updateParam('category', cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.priceRange}>
          <span className={styles.priceLabel}>Price:</span>
          <input
            type="number"
            className={styles.priceInput}
            placeholder="Min"
            min="0"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
          />
          <span>–</span>
          <input
            type="number"
            className={styles.priceInput}
            placeholder="Max"
            min="0"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
          />
        </div>
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
          <button type="button" className={styles.retryBtn} onClick={refetch}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className={styles.empty}>
          <p>No products match your search.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
