import axios from 'axios';

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1` || '',
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
  },
});

// Add a request interceptor for additional headers
api.interceptors.request.use((config) => {
  // Add Prefer header for all requests
  config.headers['Prefer'] = 'return=representation';
  return config;
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  // Get the token from localStorage
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}); 