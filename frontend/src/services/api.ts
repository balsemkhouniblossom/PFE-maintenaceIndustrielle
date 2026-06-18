import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens (if needed later)
api.interceptors.request.use(
  (config) => {
    // Add auth token here if implemented
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        const locale = window.location.pathname.split('/')[1] || 'en';
        window.location.href = `/${locale}/auth/login`;
      }
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;

type AnyObject = Record<string, unknown>;

// Generic CRUD operations
export const apiService = {
  // Users
  getUsers: () => api.get('/users'),
  createUser: (data: AnyObject) => api.post('/users', data),
  updateUser: (id: string, data: AnyObject) => api.patch(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  uploadPhoto(formData: FormData) {
    return api.post('/users/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadUserPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/users/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },


  // Machines
  getMachines: () => api.get('/machines'),
  createMachine: (data: AnyObject) => api.post('/machines', data),
  updateMachine: (id: string, data: AnyObject) => api.patch(`/machines/${id}`, data),
  deleteMachine: (id: string) => api.delete(`/machines/${id}`),

  // Machine Types
  getMachineTypes: () => api.get('/machine-types'),
  createMachineType: (data: AnyObject) => api.post('/machine-types', data),
  updateMachineType: (id: string, data: AnyObject) => api.patch(`/machine-types/${id}`, data),
  deleteMachineType: (id: string) => api.delete(`/machine-types/${id}`),

  // Module Types
  getModuleTypes: () => api.get('/module-types'),
  createModuleType: (data: AnyObject) => api.post('/module-types', data),
  updateModuleType: (id: string, data: AnyObject) => api.patch(`/module-types/${id}`, data),
  deleteModuleType: (id: string) => api.delete(`/module-types/${id}`),

  // Catalogues
  getCatalogues: () => api.get('/catalogues'),
  createCatalogue: (data: AnyObject) => api.post('/catalogues', data),
  updateCatalogue: (id: string, data: AnyObject) => api.patch(`/catalogues/${id}`, data),
  deleteCatalogue: (id: string) => api.delete(`/catalogues/${id}`),

  // Work Orders
  getWorkOrders: () => api.get('/work-orders'),
  createWorkOrder: (data: AnyObject) => api.post('/work-orders', data),
  updateWorkOrder: (id: string, data: AnyObject) => api.patch(`/work-orders/${id}`, data),
  deleteWorkOrder: (id: string) => api.delete(`/work-orders/${id}`),
  getWorkOrderStatistics: () => api.get('/work-orders/statistics'),

  // Capteurs (Sensors)
  getCapteurs: () => api.get('/capteurs'),
  createCapteur: (data: AnyObject) => api.post('/capteurs', data),
  updateCapteur: (id: string, data: AnyObject) => api.patch(`/capteurs/${id}`, data),
  deleteCapteur: (id: string) => api.delete(`/capteurs/${id}`),

  getDocuments: () => api.get('/documents'),

  getDocument: (id: string) => api.get(`/documents/${id}`),

  createDocument: (data: any) => api.post('/documents', data),

  uploadDocument: (formData: FormData) =>
    api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteDocument: (id: string) => api.delete(`/documents/${id}`),


  // Get all data for dashboard
  getDashboardData: async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/users'),
        api.get('/machines'),
        api.get('/machine-types'),
        api.get('/work-orders'),
        api.get('/catalogues'),
        api.get('/module-types'),
        api.get('/capteurs')
      ]);

      // Extract successful results, use empty arrays for failed requests
      const [
        users,
        machines,
        machineTypes,
        workOrders,
        catalogues,
        moduleTypes,
        capteurs
      ] = results.map(result =>
        result.status === 'fulfilled' ? result.value : { data: [] }
      );

      return {
        users: users.data,
        machines: machines.data,
        machineTypes: machineTypes.data,
        workOrders: workOrders.data,
        catalogues: catalogues.data,
        moduleTypes: moduleTypes.data,
        capteurs: capteurs.data
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
};
