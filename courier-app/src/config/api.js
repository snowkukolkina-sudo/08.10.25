// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000'  // Development
  : 'https://api.dandy.ru';   // Production

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/v1/users/login',
  LOGOUT: '/api/v1/users/logout',
  PROFILE: '/api/v1/users/me',
  
  // Orders
  ORDERS: '/api/v1/orders',
  ORDER_DETAIL: (id) => `/api/v1/orders/${id}`,
  ORDER_STATUS: (id) => `/api/v1/orders/${id}/status`,
  ORDER_CANCEL: (id) => `/api/v1/orders/${id}/cancel`,
  
  // Statistics
  ORDER_STATS: '/api/v1/orders/stats',
  
  // Payments
  PAYMENTS: '/api/v1/payments',
  PAYMENT_DETAIL: (id) => `/api/v1/payments/${id}`,
  
  // Fiscal
  FISCAL_RECEIPTS: '/api/v1/fiscal',
  FISCAL_DETAIL: (id) => `/api/v1/fiscal/${id}`,
};

export const API_TIMEOUT = 10000; // 10 seconds

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
