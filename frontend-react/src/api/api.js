import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/ordenes'),
  getById: (id) => api.get(`/ordenes/${id}`),
  create: (data) => api.post('/ordenes', data),
  updateStatus: (id, status) => api.put(`/ordenes/${id}/status`, status),
  addRepuesto: (orderId, repuesto) =>
    api.post(`/ordenes/${orderId}/repuestos`, repuesto),
  addServicio: (orderId, servicio) =>
    api.post(`/ordenes/${orderId}/servicios`, servicio),
  stream: (user, roles) =>
    new EventSource(`${API_BASE_URL}/ordenes/stream?user=${user}&roles=${roles}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getOrdersByStatus: () => api.get('/dashboard/orders-by-status'),
  getRevenueByMonth: () => api.get('/dashboard/revenue-by-month'),
  getTopServices: () => api.get('/dashboard/top-services'),
};

// Clients API
export const clientsAPI = {
  getAll: () => api.get('/loyalty/clientes'),
  getById: (id) => api.get(`/loyalty/clientes/${id}`),
  create: (data) => api.post('/loyalty/clientes', data),
  update: (id, data) => api.put(`/loyalty/clientes/${id}`, data),
  addPoints: (id, points) =>
    api.put(`/loyalty/clientes/${id}/puntos?points=${points}`),
  archive: (id) => api.put(`/loyalty/clientes/${id}/archive`),
  unarchive: (id) => api.put(`/loyalty/clientes/${id}/unarchive`),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => api.get('/citas'),
  create: (data) => api.post('/citas', data),
  update: (id, data) => api.put(`/citas/${id}`, data),
  updateStatus: (id, status) => api.put(`/citas/${id}/estado`, status),
  delete: (id) => api.delete(`/citas/${id}`),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/repuestos'),
  create: (data) => api.post('/repuestos', data),
  update: (id, data) => api.put(`/repuestos/${id}`, data),
  delete: (id) => api.delete(`/repuestos/${id}`),
  getLowStock: () => api.get('/repuestos/low-stock'),
};

// Reports API
export const reportsAPI = {
  getMostDamagedParts: () => api.get('/reports/most-damaged-parts'),
  getRevenueByService: () => api.get('/reports/revenue-by-service'),
  getTechnicianEfficiency: () => api.get('/reports/technician-efficiency'),
  getAverageRepairTime: () => api.get('/reports/average-repair-time'),
  generatePDF: (data) => api.post('/reports/generate-pdf', data, { responseType: 'blob' }),
  generateExcel: (data) => api.post('/reports/generate-excel', data, { responseType: 'blob' }),
};

// Client Portal API
export const clientPortalAPI = {
  getOrderByNumber: (numeroOrden) =>
    api.get(`/ordenes/numero/${numeroOrden}`),
  streamForOrder: (numeroOrden) =>
    new EventSource(`${API_BASE_URL}/ordenes/client-stream/${numeroOrden}`),
  getHistorial: (ordenId) => api.get(`/ordenes/${ordenId}/historial`),
};

export default api;
