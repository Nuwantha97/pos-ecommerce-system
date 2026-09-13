import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/database.js';

class Payment extends Model {}

Payment.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failure', 'timeout'),
    allowNull: false,
    defaultValue: 'pending',
  },
  idempotency_key: { type: DataTypes.STRING, allowNull: false, unique: true },
  attempted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  modelName: 'Payment',
  tableName: 'payments',
  timestamps: false,
});

export default Payment;