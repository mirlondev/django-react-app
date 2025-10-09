import api from './api';

export const searchAPI = {
  searchAll: async (query) => {
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search API error:', error);
      throw error;
    }
  },

  searchTickets: async (query) => {
    try {
      const response = await api.get(`/search/tickets?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search tickets error:', error);
      throw error;
    }
  },

  searchProcedures: async (query) => {
    try {
      const response = await api.get(`/search/procedures?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search procedures error:', error);
      throw error;
    }
  },
  searchInterventions: async (query) => {
    try {
      const response = await api.get(`/search/interventions?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search intervention error:', error);
      throw error;
    }
  },


  searchUsers: async (query) => {
    try {
      const response = await api.get(`/search/users?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }
};