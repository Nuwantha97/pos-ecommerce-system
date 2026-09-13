import { useState } from 'react';
import styles from './ProductForm.module.css';

export default function ProductForm({ isOpen, onClose, onSubmit, initialData }) {
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  const [name, setName] = useState(initialData?.name ?? '');
  const [price, setPrice] = useState(
    initialData?.price !== undefined && initialData?.price !== null
      ? String(initialData.price)
      : ''
  );
  const [stock, setStock] = useState(
    initialData?.stock !== undefined && initialData?.stock !== null
      ? String(initialData.stock)
      : ''
  );
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (initialData) {
        setName(initialData.name ?? '');
        setPrice(
          initialData.price !== undefined && initialData.price !== null
            ? String(initialData.price)
            : ''
        );
        setStock(
          initialData.stock !== undefined && initialData.stock !== null
            ? String(initialData.stock)
            : ''
        );
        setCategory(initialData.category ?? '');
        setImageUrl(initialData.image_url ?? '');
      } else {
        setName('');
        setPrice('');
        setStock('');
        setCategory('');
        setImageUrl('');
      }
      setError(null);
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parsedData = {
        name: name.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category: category.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      };

      await onSubmit(parsedData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={initialData ? 'Edit Product' : 'Add Product'}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            {initialData ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fields}>
            <label className={styles.field}>
              <span className={styles.labelText}>Name</span>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Product name"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.labelText}>Price ($)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className={styles.input}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="0.00"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.labelText}>Stock</span>
              <input
                type="number"
                min="0"
                className={styles.input}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                placeholder="0"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.labelText}>Category</span>
              <input
                type="text"
                className={styles.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category (optional)"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.labelText}>Image URL</span>
              <input
                type="url"
                className={styles.input}
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </label>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Product'}
          </button>
        </form>
      </div>
    </>
  );
}
