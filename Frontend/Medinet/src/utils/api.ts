// API utility functions for frontend-backend communication
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
      return Promise.reject({ message: 'An unexpected error occurred.' });
    }
  }
);

// Patient API
export const patientAPI = {
  signup: (data: { email: string; password: string; name: string; phone?: string; age?: number; gender?: string }) =>
    api.post('/patient/signup', data),
  
  signin: (data: { email: string; password: string }) =>
    api.post('/patient/signin', data),
};

// Doctor API
export const doctorAPI = {
  signup: (data: { 
    email: string; 
    password: string; 
    name: string; 
    specialty: string; 
    phone?: string; 
    experience_years?: number;
  }) => api.post('/doctor/signup', data),
  
  signin: (data: { email: string; password: string }) =>
    api.post('/doctor/signin', data),
};

// Consultation API
export const consultationAPI = {
  getConsultation: (consultationId: string) =>
    api.get(`/consultation/${consultationId}`),
  
  getPatientConsultations: (patientId: string) =>
    api.get(`/consultation/patient/${patientId}`),
  
  getConversationLogs: (consultationId: string) =>
    api.get(`/consultation/${consultationId}/logs`),
  
  getActiveConsultations: () =>
    api.get('/consultation'),
};

// Health check
export const healthCheck = () =>
  api.get('/health');

export default api;
