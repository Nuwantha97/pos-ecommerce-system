import app from './app.js';
import sequelize from './database/database.js';
import { expireStaleReservations } from './services/reservationService.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB connection established');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    setInterval(() => expireStaleReservations().catch(console.error), 30_000);
  } catch (err) {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  }
}

start();