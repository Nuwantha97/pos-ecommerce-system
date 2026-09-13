export default class InsufficientStockError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InsufficientStockError';
    this.status = 409;
  }
}