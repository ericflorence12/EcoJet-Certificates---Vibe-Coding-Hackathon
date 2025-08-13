// Global runtime config sourced from window.__env (populated by public/env.js)
// Fallbacks default to localhost for local development.
declare global {
  interface Window { __env?: Record<string, any>; }
}

const win: any = typeof window !== 'undefined' ? window : {};
const env = (win.__env ?? {}) as Record<string, any>;

export const BACKEND_BASE_URL: string = env.BACKEND_BASE_URL || 'http://localhost:8080';
export const API_BASE_URL: string = env.API_BASE_URL || `${BACKEND_BASE_URL}/api`;
