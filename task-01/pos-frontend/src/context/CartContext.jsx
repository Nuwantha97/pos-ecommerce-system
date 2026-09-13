import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'pos_cart';
const CART_ID_KEY = 'pos_cart_id';

function loadFromStorage() {
  try {
    const items = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    const cartId = sessionStorage.getItem(CART_ID_KEY) || null;
    return { items, cartId };
  } catch {
    return { items: [], cartId: null };
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadFromStorage().items);
  const [cartId, setCartId] = useState(() => loadFromStorage().cartId);
  const [refreshKey, setRefreshKey] = useState(0);

  /* Sync state → sessionStorage on every change */
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    if (cartId) {
      sessionStorage.setItem(CART_ID_KEY, cartId);
    } else {
      sessionStorage.removeItem(CART_ID_KEY);
    }
  }, [items, cartId]);

  const addItem = useCallback(({ productId, name, price, quantity = 1 }) => {
    setCartId((prev) => prev || crypto.randomUUID());
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { productId, name, price, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCartId(null);
  }, []);

  /** Increment to force product refetch across all pages */
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const itemCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const total = useMemo(
    () => items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      cartId,
      itemCount,
      total,
      refreshKey,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      triggerRefresh,
    }),
    [items, cartId, itemCount, total, refreshKey, addItem, updateQuantity, removeItem, clearCart, triggerRefresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
