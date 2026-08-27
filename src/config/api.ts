const RAW_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
const API_BASE_URL = `${RAW_URL.replace(/\/+$/, '')}/api`

export default API_BASE_URL
