import axios from 'axios';
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:2000/api', timeout: 15000 });
// This function reads the saved token immediately before each API request.
function addAuthToken(config) { const token = localStorage.getItem('astral-token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; }
// This function changes server failures into one predictable error shape.
function normalizeError(error) { 
    const response = error.response; const normalized = { message: response?.data?.message || 'Unable to connect to the server. Please try again.', status: response?.status || 0, code: response?.data?.code || '', errors: response?.data?.errors || [] }; if (normalized.status === 401) { localStorage.removeItem('astral-token'); window.dispatchEvent(new Event('astral-session-ended')); 
        
    } return Promise.reject(normalized); }
client.interceptors.request.use(addAuthToken); client.interceptors.response.use((response) => response.data, normalizeError); export default client;
