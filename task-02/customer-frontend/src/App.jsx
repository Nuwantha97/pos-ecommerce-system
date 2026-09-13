import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout/Layout';
import ProductListing from './components/ProductListing/ProductListing';
import ProductDetail from './components/ProductDetail/ProductDetail';
import OrderHistory from './components/Orders/OrderHistory';

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ProductListing />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="orders" element={<OrderHistory />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}
