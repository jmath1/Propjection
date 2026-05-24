import axios from 'axios';
import { Property, Projection, RentalUnit, ProjectionResults } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Properties
export const propertiesAPI = {
  list: () => client.get<Property[]>('/properties/'),
  get: (id: number) => client.get<Property>(`/properties/${id}/`),
  create: (data: Partial<Property>) => client.post<Property>('/properties/', data),
  update: (id: number, data: Partial<Property>) => client.patch<Property>(`/properties/${id}/`, data),
  delete: (id: number) => client.delete(`/properties/${id}/`),
};

// Projections
export const projectionsAPI = {
  list: (propertyId?: number) => {
    const params = propertyId ? { property_id: propertyId } : {};
    return client.get<Projection[]>('/projections/', { params });
  },
  get: (id: number) => client.get<Projection>(`/projections/${id}/`),
  create: (data: Partial<Projection>) => client.post<Projection>('/projections/', data),
  update: (id: number, data: Partial<Projection>) => client.patch<Projection>(`/projections/${id}/`, data),
  delete: (id: number) => client.delete(`/projections/${id}/`),
  getResults: (id: number) => client.get<ProjectionResults>(`/projections/${id}/results/`),
  getScenarios: (id: number) => client.get(`/projections/${id}/scenarios/`),
  getVerdict: (id: number) => client.get(`/projections/${id}/verdict/`),
  getSummary: (id: number) => client.get<{ summary: string }>(`/projections/${id}/summary/`),
  chat: (id: number, messages: { role: string; content: string }[]) =>
    client.post<{ reply: string }>(`/projections/${id}/chat/`, { messages }),
  duplicate: (id: number, name?: string) =>
    client.post<Projection>(`/projections/${id}/duplicate/`, { name: name || undefined }),
};

// Rental Units
export const unitsAPI = {
  list: (projectionId?: number) => {
    const params = projectionId ? { projection_id: projectionId } : {};
    return client.get<RentalUnit[]>('/units/', { params });
  },
  get: (id: number) => client.get<RentalUnit>(`/units/${id}/`),
  create: (data: Partial<RentalUnit>) => client.post<RentalUnit>('/units/', data),
  update: (id: number, data: Partial<RentalUnit>) => client.patch<RentalUnit>(`/units/${id}/`, data),
  delete: (id: number) => client.delete(`/units/${id}/`),
};

// Auth
interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export const authAPI = {
  login: (username: string, password: string) =>
    client.post<LoginResponse>('/auth/login/', { username, password }),
  register: (username: string, password: string, email?: string) =>
    client.post<LoginResponse>('/auth/register/', { username, password, email }),
};

export default client;
