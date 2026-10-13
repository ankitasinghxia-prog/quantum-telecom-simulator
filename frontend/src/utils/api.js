/**
 * API utility for connecting to backend
 * Quantum Telecom Simulator - Phase 5
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  // GET request
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  // POST request
  async post(endpoint, data = {}) {
    try {
      let url = `${API_BASE_URL}${endpoint}`;
      let options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (endpoint.includes('/network/simulate/message')) {
        const msg = data.message || data;
        if (msg) {
          url = `${url}?message=${encodeURIComponent(msg)}`;
        }
        options.body = JSON.stringify({});
      } else if (endpoint.includes('/message/send')) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(data)) {
          params.append(key, value);
        }
        url = `${url}?${params.toString()}`;
        options.body = JSON.stringify({});
      } else if (endpoint.includes('/network/simulate/qkd') || 
                 endpoint.includes('/qkd/init') ||
                 endpoint.includes('/attack/simulate') ||
                 endpoint.includes('/network/simulate/attack')) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(data)) {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        }
        const queryStr = params.toString();
        if (queryStr) {
          url = `${url}?${queryStr}`;
        }
        options.body = JSON.stringify({});
      } else {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || JSON.stringify(errorData);
        } catch (e) {
          errorDetail = await response.text();
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorDetail}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  // ============================================
  // QKD endpoints
  // ============================================
  qkd: {
    init: (numBits = 256, eveActive = false) => 
      api.post('/api/qkd/init', { num_bits: numBits, eve_active: eveActive }),
    status: () => api.get('/api/qkd/status'),
    sessions: (limit = 20) => api.get(`/api/qkd/sessions?limit=${limit}`),
  },

  // ============================================
  // Message endpoints
  // ============================================
  message: {
    send: (sender, recipient, message) => 
      api.post('/api/message/send', { sender, recipient, message }),
    receive: (encrypted) => 
      api.post('/api/message/receive', { encrypted }),
    history: (limit = 50) => api.get(`/api/message/history?limit=${limit}`),
  },

  // ============================================
  // Attack endpoints
  // ============================================
  attack: {
    simulate: (type = 'intercept_resend') => 
      api.post('/api/attack/simulate', { attack_type: type }),
    logs: (limit = 50) => api.get(`/api/attack/logs?limit=${limit}`),
  },

  // ============================================
  // Network endpoints
  // ============================================
  network: {
    status: () => api.get('/api/network/status'),
    simulator: {
      status: () => api.get('/api/network/simulator/status'),
      reset: () => api.post('/api/network/simulator/reset', {}),
      logs: (limit = 20) => api.get(`/api/network/simulator/logs?limit=${limit}`),
      demo: () => api.post('/api/network/simulator/demo', {}),
    },
    simulate: {
      qkd: (numBits = 256, eveActive = false) => 
        api.post('/api/network/simulate/qkd', { num_bits: numBits, eve_active: eveActive }),
      message: (message) => 
        api.post(`/api/network/simulate/message?message=${encodeURIComponent(message)}`, {}),
      attack: (type = 'intercept_resend') => 
        api.post('/api/network/simulate/attack', { attack_type: type }),
    },
  },

  // ============================================
  // KPI endpoints
  // ============================================
  kpi: {
    analysis: () => api.get('/api/kpi/analysis'),
  },

  // ============================================
  // Audit endpoints
  // ============================================
  audit: {
    log: (limit = 50) => api.get(`/api/audit/log?limit=${limit}`),
  },
};

export default api;