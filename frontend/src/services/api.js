// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Transactions API calls
export const transactionAPI = {
  create: async (transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transactionData),
    });
    return handleResponse(response);
  },

  getMyTransactions: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions/my`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateStatus: async (id, status, adminNotes = '') => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminNotes }),
    });
    return handleResponse(response);
  },
};

// Admin API calls
export const adminAPI = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // User Management
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUserById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  updateUserRole: async (userId, role) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Transaction Management
  getAllTransactions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/transactions?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTransactionById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/transactions/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateTransactionStatus: async (transactionId, status, adminNotes = '') => {
    const response = await fetch(`${API_BASE_URL}/admin/transactions/${transactionId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminNotes }),
    });
    return handleResponse(response);
  },

  // Reports and Analytics
  getReports: async (reportType, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/reports/${reportType}?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  exportData: async (format, dataType, params = {}) => {
    const queryString = new URLSearchParams({ ...params, dataType }).toString();
    const response = await fetch(`${API_BASE_URL}/admin/export/${format}?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // System Management
  getSystemLogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/system/logs?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  clearCache: async (cacheType) => {
    const response = await fetch(`${API_BASE_URL}/admin/system/cache`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cacheType }),
    });
    return handleResponse(response);
  },
};

// Employee API calls (for employee role)
export const employeeAPI = {
  getAssignedTransactions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/employee/transactions?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateTransaction: async (transactionId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/employee/transactions/${transactionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    return handleResponse(response);
  },

  getCustomerTransactions: async (customerId) => {
    const response = await fetch(`${API_BASE_URL}/employee/customers/${customerId}/transactions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// User API calls (for profile management)
export const userAPI = {
  updateProfile: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/update/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  changePassword: async (passwordData) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },

  deleteAccount: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Utility functions
export const apiUtils = {
  // File upload helper
  uploadFile: async (file, endpoint) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeaders().Authorization,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  // Download file helper
  downloadFile: async (url, filename) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // API health check
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },

  // Get server status
  getServerStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/system/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Request interceptor for adding auth token
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (token && options.headers) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    return await originalFetch(url, options);
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Response interceptor for handling token expiration
const setupResponseInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    let response = await originalFetch(...args);
    
    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshResponse = await authAPI.refreshToken();
        if (refreshResponse.token) {
          localStorage.setItem('token', refreshResponse.token);
          // Retry original request
          response = await originalFetch(...args);
        } else {
          // Refresh failed, redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return response;
  };
};

// Initialize response interceptor
setupResponseInterceptor();

export default {
  auth: authAPI,
  transactions: transactionAPI,
  admin: adminAPI,
  employee: employeeAPI,
  user: userAPI,
  utils: apiUtils,
};