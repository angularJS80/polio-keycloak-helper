export const DEFAULT_AUTH_CONFIG = {
  baseUrl: process.env.REACT_APP_AUTH_BASE_URL || 'http://localhost:8080',
  loginEndpoint: '/auth/login',
  refreshEndpoint: '/auth/refresh',
  autoRefresh: true,
  onTokenExpiredRedirect: '/login',
}; 