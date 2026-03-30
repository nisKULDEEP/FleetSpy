const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('fleetspy_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || response.statusText);
    }

    return response.json();
  },

  auth: {
    login: (credentials: any) =>
      api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data: any) =>
      api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },

  vehicles: {
    list: async () => {
      const data = await api.request('/vehicles');
      return data.vehicles || data;
    },
    create: (data: any) => api.request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
    getLocation: (id: string) => api.request(`/vehicles/location/${id}`),
    updateLocation: (data: any) =>
      api.request('/vehicles/location', { method: 'POST', body: JSON.stringify(data) }),
  },

  geofences: {
    list: async (category?: string) => {
      const data = await api.request(`/geofences${category ? `?category=${category}` : ''}`);
      return data.geofences || data;
    },
    create: (data: any) =>
      api.request('/geofences', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => api.request(`/geofences/${id}`, { method: 'DELETE' }),
  },

  alerts: {
    list: async (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      const data = await api.request(`/alerts${query ? `?${query}` : ''}`);
      return data.alerts || data;
    },
    configure: (data: any) =>
      api.request('/alerts/configure', { method: 'POST', body: JSON.stringify(data) }),
  },

  violations: {
    history: async (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      const data = await api.request(`/violations/history${query ? `?${query}` : ''}`);
      return data.violations || data;
    },
  },
};
