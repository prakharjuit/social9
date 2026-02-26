import api from './api';

const aiService = {
  getInsights: async (metrics) => {
    const response = await api.post('/ai/insights', { metrics });
    return response.data;
  }
};

export default aiService;
