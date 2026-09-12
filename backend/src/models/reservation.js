import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/database.js';

class Reservation extends Model {}

Reservation.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  cart_id: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  status: {
    type: DataTypes.ENUM('reserved', 'expired', 'released', 'consumed'),
    allowNull: false,
    defaultValue: 'reserved',
  },
  expires_at: { type: DataTypes.DATE, allowNull: false },
}, {
  sequelize,
  modelName: 'Reservation',
  tableName: 'reservations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['status', 'expires_at'] }, // hit by every sweep query
    { fields: ['cart_id'] },
  ],
});

export default Reservation;