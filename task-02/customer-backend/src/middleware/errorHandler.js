export default function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

export class InsufficientStockError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InsufficientStockError';
    this.status = 409;
  }
}