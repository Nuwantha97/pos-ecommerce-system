import sequelize from '../database/database.js';
import '../models/index.js';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    await sequelize.sync({ force: true });

    console.log('Tables synced: products, reservations, orders, order_items, payments');
    process.exit(0);
  } catch (err) {
    console.error('Failed to sync tables:', err);
    process.exit(1);
  }
}

main();