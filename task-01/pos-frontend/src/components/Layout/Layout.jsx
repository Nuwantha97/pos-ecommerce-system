import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartPanel from '../Cart/CartPanel';
import styles from './Layout.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/catalog', label: 'Catalog' },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Order History' },
];

export default function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <div className={styles.layout}>
      <header className={styles.topBar}>
        <div className={styles.logo}>POS System</div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={styles.cartBtn}
          onClick={() => setIsCartOpen(true)}
          aria-label="Open cart"
        >
          <svg className={styles.cartIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
        </button>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
