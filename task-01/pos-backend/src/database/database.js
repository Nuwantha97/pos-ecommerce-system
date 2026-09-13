import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Neon uses self-signed-style certs in the chain; this is expected, not a security downgrade for this use case
    },
  },
  pool: { max: 5, min: 0, idle: 10000 },
  logging: false,
});

export default sequelize;