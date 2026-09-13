import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Catalog from './components/Catalog/Catalog';
import Products from './components/Products/Products';
import OrderHistory from './components/Orders/OrderHistory';

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<OrderHistory />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}
