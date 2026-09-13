export const ORDER_STATUSES = Object.freeze({
  PENDING: 'pending',
  RESERVED: 'reserved',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
});

const TRANSITIONS = {
  [ORDER_STATUSES.PENDING]:   [ORDER_STATUSES.RESERVED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.RESERVED]:  [ORDER_STATUSES.PAID, ORDER_STATUSES.FAILED, ORDER_STATUSES.EXPIRED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PAID]:      [ORDER_STATUSES.CANCELLED, ORDER_STATUSES.REFUNDED],
  [ORDER_STATUSES.FAILED]:    [],
  [ORDER_STATUSES.CANCELLED]: [],
  [ORDER_STATUSES.EXPIRED]:   [],
  [ORDER_STATUSES.REFUNDED]:  [],
};

export function canTransition(from, to) {
  return Boolean(TRANSITIONS[from]?.includes(to));
}

export class InvalidTransitionError extends Error {
  constructor(from, to) {
    super(`Cannot transition order from "${from}" to "${to}"`);
    this.name = 'InvalidTransitionError';
    this.status = 409; // for the central error middleware to map to a response code
    this.from = from;
    this.to = to;
  }
}

// Every service that changes order.status calls this instead of assigning directly.
export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}