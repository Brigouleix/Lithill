import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
});

// Injecte le token Bearer à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lithill_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Injecte le token CSRF depuis le cookie pour les mutations
  const csrf = document.cookie
    .split('; ')
    .find((r) => r.startsWith('csrf_token='))
    ?.split('=')[1];
  if (csrf) config.headers['X-CSRF-Token'] = csrf;

  return config;
});

// Redirige vers /login si 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lithill_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
