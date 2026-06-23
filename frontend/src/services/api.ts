import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://pfe-maintenaceindustrielle.onrender.com';

if (typeof window === 'undefined') {
  // Server-side startup log (visible in Vercel Function logs)
  console.log(`[API] Base URL resolved to: ${API_BASE_URL}`);
} else if (process.env.NODE_ENV !== 'production') {
  // Client-side dev log only — avoids leaking config in production browser console
  console.log(`[API] Base URL resolved to: ${API_BASE_URL}`);
}

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
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || '');
    const isAuthEndpoint = /\/auth\/(login|register|forgot-password|reset-password)/.test(requestUrl);
    const isExpectedAuthFailure = status === 401 && isAuthEndpoint;

    if (status === 401 && !isAuthEndpoint) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        const locale = window.location.pathname.split('/')[1] || 'en';
        window.location.href = `/${locale}/auth/login`;
      }
    }
    if (!isExpectedAuthFailure) {
      console.error('API Error:', error);
    }
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

  // Modules
  getModules: () => api.get('/modules'),
  createModule: (data: AnyObject) => api.post('/modules', data),
  updateModule: (id: string, data: AnyObject) => api.patch(`/modules/${id}`, data),
  deleteModule: (id: string) => api.delete(`/modules/${id}`),

  // Maintenance Plans
  getMaintenancePlans: () => api.get('/maintenance-plans'),
  createMaintenancePlan: (data: AnyObject) => api.post('/maintenance-plans', data),
  updateMaintenancePlan: (id: string, data: AnyObject) => api.patch(`/maintenance-plans/${id}`, data),
  deleteMaintenancePlan: (id: string) => api.delete(`/maintenance-plans/${id}`),

  // Catalogues
  getCatalogues: () => api.get('/catalogues'),
  createCatalogue: (data: AnyObject) => api.post('/catalogues', data),
  updateCatalogue: (id: string, data: AnyObject) => api.patch(`/catalogues/${id}`, data),
  deleteCatalogue: (id: string) => api.delete(`/catalogues/${id}`),

  // Stocks
  getStocks: () => api.get('/stocks'),
  createStock: (data: AnyObject) => api.post('/stocks', data),
  updateStock: (id: string, data: AnyObject) => api.patch(`/stocks/${id}`, data),
  deleteStock: (id: string) => api.delete(`/stocks/${id}`),

  // OT Pieces
  getOtPieces: () => api.get('/ot-pieces'),
  createOtPiece: (data: AnyObject) => api.post('/ot-pieces', data),
  updateOtPiece: (id: string, data: AnyObject) => api.patch(`/ot-pieces/${id}`, data),
  deleteOtPiece: (id: string) => api.delete(`/ot-pieces/${id}`),

  // Lubrifiants and logs
  getLubrifiants: () => api.get('/lubrifiants'),
  createLubrifiant: (data: AnyObject) => api.post('/lubrifiants', data),
  updateLubrifiant: (id: string, data: AnyObject) => api.patch(`/lubrifiants/${id}`, data),
  deleteLubrifiant: (id: string) => api.delete(`/lubrifiants/${id}`),
  getLubrificationLogs: () => api.get('/lubrification-logs'),
  createLubrificationLog: (data: AnyObject) => api.post('/lubrification-logs', data),
  updateLubrificationLog: (id: string, data: AnyObject) => api.patch(`/lubrification-logs/${id}`, data),
  deleteLubrificationLog: (id: string) => api.delete(`/lubrification-logs/${id}`),

  // KPI
  getKpis: () => api.get('/kpis'),
  createKpi: (data: AnyObject) => api.post('/kpis', data),
  updateKpi: (id: string, data: AnyObject) => api.patch(`/kpis/${id}`, data),
  deleteKpi: (id: string) => api.delete(`/kpis/${id}`),

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

  // Intervention Reports
  getInterventionReports: () => api.get('/intervention-reports'),
  createInterventionReport: (data: AnyObject) => api.post('/intervention-reports', data),
  updateInterventionReport: (id: string, data: AnyObject) => api.patch(`/intervention-reports/${id}`, data),
  deleteInterventionReport: (id: string) => api.delete(`/intervention-reports/${id}`),

  // Pannes
  getPannes: () => api.get('/pannes'),
  createPanne: (data: AnyObject) => api.post('/pannes', data),
  updatePanne: (id: string, data: AnyObject) => api.patch(`/pannes/${id}`, data),
  deletePanne: (id: string) => api.delete(`/pannes/${id}`),

  // Panne Solutions
  getPanneSolutions: () => api.get('/panne-solutions'),
  createPanneSolution: (data: AnyObject) => api.post('/panne-solutions', data),
  updatePanneSolution: (id: string, data: AnyObject) => api.patch(`/panne-solutions/${id}`, data),
  deletePanneSolution: (id: string) => api.delete(`/panne-solutions/${id}`),

  getDocuments: () => api.get('/documents'),

  getDocument: (id: string) => api.get(`/documents/${id}`),

  createDocument: (data: any) => api.post('/documents', data),

  updateDocument: (id: string, data: AnyObject) => api.put(`/documents/${id}`, data),

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
