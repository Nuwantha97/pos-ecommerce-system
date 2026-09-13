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

export async function updateProduct(id, updates) {
  const product = await Product.findByPk(id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  await product.update(updates);
  return product;
}

export async function deleteProduct(id) {
  const product = await Product.findByPk(id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  await product.destroy();
  return product;
}