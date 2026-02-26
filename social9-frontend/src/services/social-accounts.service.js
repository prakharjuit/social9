import api from './api';

const socialAccountsService = {
  /**
   * Get all connected social accounts
   */
  getAccounts: async () => {
    const response = await api.get('/social-accounts');
    return response.data;
  },

  /**
   * Get Instagram OAuth URL
   */
  getInstagramAuthUrl: async () => {
    const response = await api.get('/social-accounts/instagram/auth-url');
    return response.data.authUrl;
  },

  /**
   * Get LinkedIn OAuth URL
   */
  getLinkedInAuthUrl: async () => {
    const response = await api.get('/social-accounts/linkedin/auth-url');
    return response.data.authUrl;
  },

  /**
   * Disconnect a social account
   */
  disconnectAccount: async (accountId) => {
    const response = await api.delete(`/social-accounts/${accountId}`);
    return response.data;
  },

  /**
   * Refresh account token
   */
  refreshToken: async (accountId) => {
    const response = await api.post(`/social-accounts/${accountId}/refresh`);
    return response.data;
  },

  /**
   * Connect Instagram account (opens OAuth flow)
   */
  connectInstagram: async () => {
    const authUrl = await socialAccountsService.getInstagramAuthUrl();
    window.location.href = authUrl;
  },

  /**
   * Get analytics for a connected account
   */
  getAnalytics: async (accountId, opts = {}) => {
    // opts may include since and until
    const params = {};
    if (opts.since) params.since = opts.since;
    if (opts.until) params.until = opts.until;
    const response = await api.get(`/social-accounts/${accountId}/analytics`, { params });
    return response.data;
  },
  

  /**
   * Connect LinkedIn account (opens OAuth flow)
   */
  connectLinkedIn: async () => {
    const authUrl = await socialAccountsService.getLinkedInAuthUrl();
    window.location.href = authUrl;
  },
};

export default socialAccountsService;
