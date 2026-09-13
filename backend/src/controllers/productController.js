import * as productService from '../services/productService.js';

export async function createProduct(req, res, next) {
  try {
    const { name, price, stock, category, image_url } = req.body;

    if (!name || price == null || stock == null) {
      return res.status(400).json({ error: 'name, price, and stock are required' });
    }

    const product = await productService.createProduct({ name, price, stock, category, image_url });
    res.status(201).json(product);
  } catch (err) {
    next(err); // hand off to errorHandler middleware
  }
}

export async function getAllProducts(req, res, next) {
  try {
    const { category } = req.query;
    const products = await productService.getAllProducts(category);
    res.json(products);
  } catch (err) {
    next(err);
  }
}