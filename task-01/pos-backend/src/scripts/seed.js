import sequelize from '../database/database.js';
import { Product } from '../models/index.js';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    await Product.bulkCreate([
  { name: 'Logitech M185 Wireless Mouse',       price: 2900.00,  stock: 1,   category: 'electronics', image_url:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY5GIEPz4l_qF-uunjhwnBTjp466pZksQdARjl4Db2VoCJ7ivNRQd2Q3Se&s=10' }, // low stock — concurrency test target
  { name: 'Anker PowerCore 10000 Power Bank',   price: 5900.00,  stock: 2,   category: 'electronics', image_url:'https://static-01.daraz.lk/p/8e6ab20f38a07b1a4b1ba87eea9f9cc8.jpg' }, // low stock — concurrency test target
  { name: 'HP DeskJet Ink Cartridge (Black)',   price: 3200.00,  stock: 25,  category: 'office', image_url:'https://mmsrilanka.com/image/cache/catalog/data/Products/Ink%20Cartridges/HP%20ink%20Cartridge/678-550x550w.png' },
  { name: 'Samsung 32GB USB Flash Drive',       price: 2400.00,  stock: 40,  category: 'electronics', image_url:'https://static-01.daraz.lk/p/2f84029fa37a6b354636c49694f35fb3.jpg' },
  { name: 'Anker USB-C 4-Port Hub',             price: 10500.00, stock: 15,  category: 'electronics', image_url:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUKd0QgLiFKCBlfYWCDLfSK2-SzrA5hbpNZSco6WlsFhQZWUr8sGyVvOOV&s=10' },
  { name: 'Logitech K380 Mechanical Keyboard',  price: 24000.00, stock: 8,   category: 'electronics', image_url:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvfKIN8JJEsihAIyhJZIX0sfvfEH2qKZmjW8JWhlTSQg&s=10' },
  { name: 'Philips LED Desk Lamp',              price: 6500.00,  stock: 30,  category: 'home', image_url:'https://media.4rgos.it/s/Argos/3032972_R_SET?$Main768$&w=620&h=620' },
  { name: 'Ceramic Coffee Mug (350ml)',         price: 1200.00,  stock: 100, category: 'home', image_url:'https://img.drz.lazcdn.com/static/lk/p/e3e788056a19a0aa831aae713318038c.jpg_960x960q80.jpg_.webp' },
  { name: 'A5 Ruled Notebook',                  price: 450.00,   stock: 200, category: 'office', image_url:'https://shop.alston.lk/wp-content/uploads/2022/03/WhatsApp-Image-2024-10-18-at-12.53.08.jpeg' },
  { name: 'Parker Ballpoint Pen Set (5pc)',     price: 2500.00,  stock: 60,  category: 'office', image_url:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvUB1FgwX7JZCQZusdoEsgRYqEh93gd4CLhieP-9Uyw_f-smRhxvc7pNQ&s=10' },
  { name: 'Stapler with 1000 Staples',          price: 950.00,   stock: 50,  category: 'office', image_url:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzKBqsNgULJaMQVTGRXQpGWM6U4e11vl3vb9D6TY2ULg&s=10' }
]);

    console.log('Seeded 12 products (3 low-stock: Widget A, Widget B, Webcam HD).');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed products:', err);
    process.exit(1);
  }
}

main();