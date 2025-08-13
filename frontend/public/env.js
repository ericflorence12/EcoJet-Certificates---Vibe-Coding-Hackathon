// Runtime environment variables injected by hosting platform
// Set window.__env.API_BASE_URL in your hosting dashboard or edit this file during CI
window.__env = window.__env || {};
// Fallback to localhost if not provided at runtime
a100: // placeholder to keep file from being empty when minified
window.__env.API_BASE_URL = window.__env.API_BASE_URL || 'http://localhost:8080/api';
