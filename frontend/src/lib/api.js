import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('collab_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthorized requests
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, we could auto-logout but let the UI handle specific errors
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// API Service Call wrappers
export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (name, email, password, role) => apiClient.post('/auth/register', { name, email, password, role }),
  me: () => apiClient.get('/auth/me'),
  seed: () => apiClient.post('/auth/seed'),
};

export const projectsAPI = {
  getAll: () => apiClient.get('/projects'),
  getById: (id) => apiClient.get(`/projects/${id}`),
  create: (projectData) => apiClient.post('/projects', projectData),
  update: (id, projectData) => apiClient.put(`/projects/${id}`, projectData),
  delete: (id) => apiClient.delete(`/projects/${id}`),
  addMember: (id, memberId) => apiClient.post(`/projects/${id}/members`, { memberId }),
};

export const tasksAPI = {
  getAll: (filters) => apiClient.get('/tasks', { params: filters }),
  getById: (id) => apiClient.get(`/tasks/${id}`),
  create: (taskData) => apiClient.post('/tasks', taskData),
  update: (id, taskData) => apiClient.put(`/tasks/${id}`, taskData),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
  addComment: (id, text) => apiClient.post(`/tasks/${id}/comments`, { text }),
  uploadAttachment: (id, formData) => apiClient.post(`/tasks/${id}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const teamAPI = {
  getAll: () => apiClient.get('/team'),
  create: (memberData) => apiClient.post('/team', memberData),
  getWorkload: () => apiClient.get('/team/workload'),
};

export const activitiesAPI = {
  getRecent: (limit) => apiClient.get('/activities', { params: { limit } }),
};

export default apiClient;
