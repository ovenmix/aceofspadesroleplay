const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const api = {
  // Authentication
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  verifyToken: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  // Player Management
  getPlayers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/players`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getPlayerStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/players/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Moderation Actions
  warnPlayer: async (playerId, reason) => {
    const response = await fetch(`${API_BASE_URL}/api/moderation/warn`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ playerId, reason })
    });
    return handleResponse(response);
  },

  kickPlayer: async (playerId, reason) => {
    const response = await fetch(`${API_BASE_URL}/api/moderation/kick`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ playerId, reason })
    });
    return handleResponse(response);
  },

  banPlayer: async (playerId, reason, duration) => {
    const response = await fetch(`${API_BASE_URL}/api/moderation/ban`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ playerId, reason, duration })
    });
    return handleResponse(response);
  },

  addMoney: async (playerId, amount, type) => {
    const response = await fetch(`${API_BASE_URL}/api/players/money`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ playerId, amount, type })
    });
    return handleResponse(response);
  },

  // Moderation History
  getModerationHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/api/moderation/history`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Department Management
  getDepartments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/departments`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateDepartment: async (department, data) => {
    const response = await fetch(`${API_BASE_URL}/api/departments/${department}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  addCommandMember: async (department, memberData) => {
    const response = await fetch(`${API_BASE_URL}/api/departments/${department}/command`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(memberData)
    });
    return handleResponse(response);
  },

  updateDocument: async (department, docId, docData) => {
    const response = await fetch(`${API_BASE_URL}/api/departments/${department}/documents/${docId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(docData)
    });
    return handleResponse(response);
  },

  // Server Settings
  getServerSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateServerSettings: async (settings) => {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    return handleResponse(response);
  },

  // System Status
  getSystemStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/api/system/status`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createBackup: async () => {
    const response = await fetch(`${API_BASE_URL}/api/system/backup`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};