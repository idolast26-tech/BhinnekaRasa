/**
 * Centralized API base URL.
 * Set VITE_API_URL in .env (local) or in your hosting env vars (production).
 * Fallback to localhost for local development.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export default API_BASE_URL
