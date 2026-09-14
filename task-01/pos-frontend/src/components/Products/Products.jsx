import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import ProductForm from './ProductForm';
import styles from './Products.module.css';

export default function Products() {
  const {
    products,
    loading,
    error,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;

    setActionError(null);
    try {
      await deleteProduct(id);
      await refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to delete product');
    }
  };

  const handleFormSubmit = async (formData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
    } else {
      await createProduct(formData);
    }
    await refetch();
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Products</h1>
        <button
          type="button"
          className={styles.addBtn}
          onClick={handleAddProduct}
        >
          + Add Product
        </button>
      </div>

      {actionError && (
        <div className={styles.actionError} role="alert">
          <span>{actionError}</span>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {loading && (
        <div className={styles.stateContainer}>
          <div className={styles.spinner} />
          <p>Loading products...</p>
        </div>
      )}

      {!loading && error && (
        <div className={styles.stateContainer}>
          <p className={styles.errorText}>{error}</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={refetch}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>No products found.</p>
          <button
            type="button"
            className={styles.addBtn}
            onClick={handleAddProduct}
          >
            + Add Product
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className={styles.nameCell}>{product.name}</td>
                  <td className={styles.categoryCell}>{product.category || '—'}</td>
                  <td className={styles.priceCell}>
                    Rs.{parseFloat(product.price || 0).toFixed(2)}
                  </td>
                  <td className={styles.stockCell}>{product.stock}</td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actionsGroup}>
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
      />
    </div>
  );
}
