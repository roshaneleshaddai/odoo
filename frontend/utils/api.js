import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://odoo-5534.onrender.com/ap',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}
