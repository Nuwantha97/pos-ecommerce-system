import sequelize from '../database/database.js';
import { Product } from '../models/index.js';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    await Product.bulkCreate([
      { name: 'Widget A',        price: 9.99,   stock: 1,  category: 'tools' },      // low stock — concurrency test target
      { name: 'Widget B',        price: 19.99,  stock: 2,  category: 'tools' },      // low stock — concurrency test target
      { name: 'Widget C',        price: 14.50,  stock: 25, category: 'tools' },
      { name: 'Bluetooth Mouse', price: 24.99,  stock: 40, category: 'electronics' },
      { name: 'USB-C Hub',       price: 34.99,  stock: 15, category: 'electronics' },
      { name: 'Mechanical Keyboard', price: 79.99, stock: 8, category: 'electronics' },
      { name: 'Desk Lamp',       price: 22.00,  stock: 30, category: 'home' },
      { name: 'Coffee Mug',      price: 12.00,  stock: 100, category: 'home' },
      { name: 'Notebook',        price: 4.99,   stock: 200, category: 'office' },
      { name: 'Pen Set',         price: 8.50,   stock: 60, category: 'office' },
      { name: 'Standing Mat',    price: 45.00,  stock: 5,  category: 'home' },
      { name: 'Webcam HD',       price: 39.99,  stock: 3,  category: 'electronics' }, // low stock — concurrency test target
    ]);

    console.log('Seeded 12 products (3 low-stock: Widget A, Widget B, Webcam HD).');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed products:', err);
    process.exit(1);
  }
}

main();