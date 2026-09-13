import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/database.js';

class Product extends Model {}

Product.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
  category: { type: DataTypes.STRING, allowNull: true },
  image_url: { type: DataTypes.STRING, allowNull: true },
}, {
  sequelize,
  modelName: 'Product',
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default Product;