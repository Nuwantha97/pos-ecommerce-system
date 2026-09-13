import Product from './product.js';
import Reservation from './reservation.js';
import Order from './order.js';
import OrderItem from './orderItem.js';
import Payment from './payment.js';

Product.hasMany(Reservation, { foreignKey: 'product_id' });
Reservation.belongsTo(Product, { foreignKey: 'product_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

Order.hasMany(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

export { Product, Reservation, Order, OrderItem, Payment };