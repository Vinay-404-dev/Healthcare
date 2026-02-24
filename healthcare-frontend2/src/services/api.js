import axios from 'axios';

const API_BASE_URL = 'http://16.170.24.98:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const healthAPI = {
    checkHealth: () => api.get('/health'),
    checkReadiness: () => api.get('/ready'),
};

export const patientsAPI = {
    getAll: () => api.get('/api/patients'),
    getById: (id) => api.get(`/api/patients/${id}`),
    create: (data) => api.post('/api/patients', data),
    update: (id, data) => api.put(`/api/patients/${id}`, data),
    delete: (id) => api.delete(`/api/patients/${id}`),
};

export const appointmentsAPI = {
    getAll: () => api.get('/api/appointments'),
    create: (data) => api.post('/api/appointments', data),
    update: (id, data) => api.put(`/api/appointments/${id}`, data),
    delete: (id) => api.delete(`/api/appointments/${id}`),
};

export const recordsAPI = {
    getByPatient: (patientId) => api.get(`/api/patients/${patientId}/records`),
    create: (data) => api.post('/api/records', data),
    delete: (id) => api.delete(`/api/records/${id}`),
};

export default api;
