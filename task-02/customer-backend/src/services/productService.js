import { Op } from 'sequelize';
import { Product } from '../models/index.js';

export async function getAllProducts({ category, search, minPrice, maxPrice } = {}) {
  const where = {};
  if (category && category !== 'all') where.category = category;
  if (search) where.name = { [Op.like]: `%${search}%` };
  if (minPrice != null || maxPrice != null) {
    where.price = {};
    if (minPrice != null) where.price[Op.gte] = minPrice;
    if (maxPrice != null) where.price[Op.lte] = maxPrice;
  }
  return Product.findAll({ where });
}

export async function getProductById(id) {
  const product = await Product.findByPk(id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return product;
}