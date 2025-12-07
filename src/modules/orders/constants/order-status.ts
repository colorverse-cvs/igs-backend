export const ORDER_STATUSES = ['pending', 'placed', 'shipped', 'delivered', 'cancelled', 'returned'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

// allowed transitions map (from -> [to])
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['placed', 'cancelled'],
  placed: ['shipped', 'cancelled', 'returned'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};