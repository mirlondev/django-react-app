import axios from "axios";
const API_BASE_URL = "https://backend-support-production.up.railway.app/api/";
//const API_BASE_URL = "http://127.0.0.1:8000/api/";
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Store tokens in memory instead of localStorage
let accessToken = null;
let refreshToken = null;

// Function to set tokens (called by AuthContext)
export const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
};

// Function to clear tokens (called by AuthContext)
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

// Function to get current access token
export const getAccessToken = () => accessToken;

// JWT Interceptor
api.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        // Update the access token
        accessToken = res.data.access;

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
api.interceptors.request.use((config) => {
  if (config.url && !config.url.endsWith('/')) {
    config.url += '/';
  }
  return config;
});
api.get("/auth/me/").then(res => console.log(res.data));
// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login/", credentials),

  refresh: (refresh) => api.post("/auth/refresh/", { refresh }),

  me: () => api.get("/auth/me/"),

  logout: () => api.post("/auth/logout/"),
};

// Tickets API
export const ticketsAPI = {
  getAll: () => api.get("/tickets/"),

  create: (ticket) => {
    const isFormData = ticket instanceof FormData;
  
    return api.post("/tickets/", ticket, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });
  },

  getById: (id) => api.get(`/tickets/${id}/`),
  update: (id, ticket) => api.patch(`/tickets/${id}/`, ticket),

  delete: (id) => api.delete(`/tickets/${id}/`),

  assign: (ticketId,techId) =>
  api.post(`/tickets/${ticketId}/assign/`, { technician_id: techId }),


  closeTicket: (id, report) => api.post(`/tickets/${id}/close/`, { report }),
};

// Clients API
export const clientsAPI = {
  getAll: () => api.get("/clients/"),

  create: (client) => api.post("/clients/", client),

  update: (id, client) => api.put(`/clients/${id}/`, client),

  delete: (id) => api.delete(`/clients/${id}/`),
};

// Technicians API
export const techniciansAPI = {
  getAll: () => api.get("/technicians/"),

  create: (tech) => api.post("/technicians/", tech),

  update: (id, tech) => api.put(`/technicians/${id}/`, tech),

  delete: (id) => api.delete(`/technicians/${id}/`),
  getActiveTechniciansCount: () => api.get('/active-technicians-stats/'),

  
};

// Interventions API
export const interventionsAPI = {
  getById: (id) => api.get(`/interventions/${id}`),
  getAll: () => api.get("/interventions/"),
  getByTicketId: (ticketId) => api.get(`/interventions/?ticket=${ticketId}`),

  create: (intervention) => api.post("/interventions/", intervention),
  update: (id, intervention) => api.put(`/interventions/${id}/`, intervention),
  delete: (id, intervention) => api.delete(`/interventions/${id}/`, intervention),


};

// Users API
export const usersAPI = {
  getProfile: () => api.get("/profile/"),

  
  updateProfile: (data) => api.patch("/profile/", data),
  
  uploadAvatar: (formData) => 
    api.post("/profile/avatar/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  
  changePassword: (data) => api.post("/profile/change-password/", data),
  
  getAll: () => api.get("/users/"),
  
  getById: (id) => api.get(`/users/${id}/`),
  
  //update: (id, data) => api.patch(`/users/${id}/`, data),
  
  delete: (id) => api.delete(`/users/${id}/`),

  update: (id, data) => api.patch(`/users/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }}),
  create: (data) => api.post('/users/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

};

export const ratingsAPI = {
  // Technician ratings
  rateTechnician: (technicianId, data) => api.post(`/technicians/${technicianId}/ratings/`, data),
  
  // Client ratings
  getClientRatings: (clientId) => api.get(`/clients/${clientId}/ratings/`),
  rateClient: (clientId, data) => api.post(`/clients/${clientId}/ratings/`, data),
  
  // User ratings
  getUserRatings: () => api.get('/user-ratings/'),
  
  // Check if user can rate
  canRateTechnician: (technicianId) => api.get(`/technicians/${technicianId}/can-rate/`),
  canRateClient: (clientId) => api.get(`/clients/${clientId}/can-rate/`),

  
    // Get technician ratings
    getTechnicianRatings: (technicianId) => {
      return api.get(`/technicians/${technicianId}/ratings/`);
    },
 
 
};

export const exportAPI = {
  export: (format, filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    
    return api.get(`/tickets/export/${format}/?${params.toString()}/`, {
      responseType: 'blob' // Important for file downloads
    });
  },
};

export const reportAPI = {
  // Get intervention PDF report
  getInterventionPDF: (interventionId) => {
    return api.get(`/interventions/${interventionId}/export/pdf/`, {
      responseType: 'blob'
    });
  },

  // Get monthly Excel report
  getMonthlyReport: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    return api.get(`/interventions/monthly-report/excel/?${params.toString()}`, {
      responseType: 'blob'
    });
  }
};
export const whatsappAPI = {
  sendToClient: (ticketId, message) => 
    api.post(`/tickets/${ticketId}/send-to-client/`, { content: message }),
  
  sendToTechnician: (ticketId, message) => 
    api.post(`/tickets/${ticketId}/send-to-technician/`, { content: message }),
  
  // Historique
  getMessageHistory: (ticketId) => 
    api.get(`/tickets/${ticketId}/whatsapp-messages/`),
  
  // Statut des messages
  getMessageStatus: (messageId) => 
    api.get(`/messages/${messageId}/status/`),
  // Envoyer un message WhatsApp
  sendMessage: (ticketId, message) => 
    api.post(`/tickets/${ticketId}/send-whatsapp/`, { content: message }),

  // Vérifier si WhatsApp est configuré
  checkConfig: () => api.get('/whatsapp/config/'),

  // Obtenir l'historique des messages WhatsApp
  getMessageHistory: (ticketId) => 
    api.get(`/tickets/${ticketId}/whatsapp-messages/`),
};


// Notifications API
export const notificationsAPI = {
  getAll: () => api.get("/notifications/"),
  markAsRead: (id) => api.patch(`/notifications/${id}/`, { is_read: true }),
  markAllAsRead: () => api.post("/notifications/mark-all-read/"),
  getUnread: () => api.get("/notifications/unread/"),
  getUnreadCount: () => api.get("/notifications/stats/"),
};




export const proceduresAPI = {
  // Procedure CRUD operations
  getAll: (params) => {
    return api.get('/procedures/', { params });
  },

  getById: (id) => {
    return api.get(`/procedures/${id}/`);
  },

  create: (data) => {
    return api.post('/procedures/', data);
  },

  update: (id, data) => {
    return api.patch(`/procedures/${id}/`, data);
  },

  delete: (id) => {
    return api.delete(`/procedures/${id}/`);
  },

  // Image management
  getImages: (procedureId) => {
    const params = procedureId ? { procedure_id: procedureId } : {};
    return api.get('/procedures/images/', { params });
  },

  uploadImage: (formData) => {
    return api.post('/procedures/upload_image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteImage: (imageId) => {
    return api.delete(`/procedures/images/${imageId}/`);
  },

  // Attachment management
  getAttachments: (procedureId) => {
    const params = procedureId ? { procedure_id: procedureId } : {};
    return api.get('/procedures/attachments/', { params });
  },

  uploadAttachment: (formData) => {
    return api.post('/procedures/upload_attachment/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteAttachment: (attachmentId) => {
    return api.delete(`/procedures/attachments/${attachmentId}/`);
  },

  // Tag management
  getTags: () => {
    return api.get('/procedures/tags/');
  },

  createTag: (data) => {
    return api.post('/procedures/tags/', data);
  },

  // Media serving
  getMediaUrl: (fileType, fileId) => {
    return `${API_BASE_URL}/procedures/media/${fileType}/${fileId}/`;
  },

  // Bulk operations
  bulkUploadImages: async (procedureId, files) => {
    const uploadPromises = files.map(file => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('procedure_id', procedureId);
      return proceduresAPI.uploadImage(formData);
    });

    const responses = await Promise.all(uploadPromises);
    return responses.map(response => response.data);
  },

  // Content processing for embedded media
  processContentImages: async (content, procedureId) => {
    // This function would process content to replace data URLs with actual URLs
    // after images have been uploaded to the server
    let processedContent = content;
    
    // Find all data URL images in content
    const dataUrlRegex = /<img[^>]+src="data:image\/[^;]+;base64,[^"]+"/g;
    const matches = content.match(dataUrlRegex);
    
    if (matches && matches.length > 0) {
      // For now, we'll just return the original content
      // In a real implementation, you'd want to:
      // 1. Extract the data URLs
      // 2. Convert them to files
      // 3. Upload them
      // 4. Replace the data URLs with the new URLs
      console.log(`Found ${matches.length} embedded images to process`);
    }
    
    return processedContent;
  },

  // Utility functions
  downloadAttachment: (attachmentId, filename) => {
    const url = proceduresAPI.getMediaUrl('attachment', attachmentId);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Search and filtering
  search: (query, filters) => {
    const params = {
      search: query,
      ...filters,
      tags: filters?.tags?.join(','),
    };
    return api.get('/procedures/', { params });
  },

  // Analytics (if needed)
  incrementView: (id) => {
    // This would be handled automatically by the backend when fetching a procedure
    return proceduresAPI.getById(id);
  },

  // Export/Import functionality
  exportProcedure: (id, format = 'json') => {
    return api.get(`/procedures/${id}/export/`, {
      params: { format },
      responseType: format === 'json' ? 'json' : 'blob',
    });
  },

  interaction: (procedureId, data) => {
    return api.post(`/procedures/${procedureId}/interaction/`, data);
  },

  importProcedure: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/procedures/import/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;