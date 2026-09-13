import { Product } from '../models/index.js';

export async function createProduct({ name, price, stock, category, image_url = null }) {
  return Product.create({ name, price, stock, category, image_url });
}

export async function getAllProducts(category) {
  if (!category || category === 'All') {
    return Product.findAll();
  }
  return Product.findAll({ where: { category } });
}