import { Product } from '../models/index.js';

export async function createProduct({ name, price, stock, category }) {
  return Product.create({ name, price, stock, category });
}

export async function getAllProducts() {
  return Product.findAll();
}