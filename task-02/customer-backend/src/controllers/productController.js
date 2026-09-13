import * as productService from '../services/productService.js';

export async function getAllProducts(req, res, next) {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    const products = await productService.getAllProducts({
      category, search,
      minPrice: minPrice != null ? Number(minPrice) : undefined,
      maxPrice: maxPrice != null ? Number(maxPrice) : undefined
    });
    res.json(products);
  } catch (err) { next(err); }
}

export async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (err) { next(err); }
}