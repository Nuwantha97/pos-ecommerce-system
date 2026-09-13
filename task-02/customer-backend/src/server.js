import app from './app.js';
import sequelize from './database/database.js';

const PORT = process.env.PORT || 3001; // different port than pos-backend if running both locally

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Shop backend: DB connection established');
    app.listen(PORT, () => console.log(`Shop backend running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  }
}

start();