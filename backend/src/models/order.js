import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/database.js';

class Order extends Model {}

Order.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cart_id: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'reserved', 'paid', 'failed', 'expired', 'cancelled', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
  },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  idempotency_key: { type: DataTypes.STRING, allowNull: false, unique: true },
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Order;