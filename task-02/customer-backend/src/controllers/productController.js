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

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, price, stock, category, image_url } = req.body;
    const product = await productService.updateProduct(id, { name, price, stock, category, image_url });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}