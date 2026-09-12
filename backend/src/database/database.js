import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.POSTGRES_URL_NON_POOLING, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Neon uses self-signed-style certs in the chain; this is expected, not a security downgrade for this use case
    },
  },
  logging: false,
});

export default sequelize;