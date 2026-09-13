import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/database.js';

class OrderItem extends Model {}

OrderItem.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price_at_purchase: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  sequelize,
  modelName: 'OrderItem',
  tableName: 'order_items',
  timestamps: false,
});

export default OrderItem;