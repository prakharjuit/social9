const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Store OAuth states temporarily (in production, use Redis)
const oauthStates = new Map();

class InstagramOAuthService {
  constructor() {
    this.clientId = process.env.FACEBOOK_CLIENT_ID;
    this.clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    this.baseUrl = 'https://www.facebook.com/v18.0';
    this.graphUrl = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(userId) {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state with user ID (expires in 10 minutes)
    oauthStates.set(state, { userId, expires: Date.now() + 10 * 60 * 1000 });
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
      state: state,
      response_type: 'code'
    });
    
    return `${this.baseUrl}/dialog/oauth?${params.toString()}`;
  }

  /**
   * Verify OAuth state parameter
   */
  verifyState(state) {
    const stateData = oauthStates.get(state);
    
    if (!stateData) {
      throw new Error('Invalid state parameter');
    }
    
    if (Date.now() > stateData.expires) {
      oauthStates.delete(state);
      throw new Error('State parameter expired');
    }
    
    oauthStates.delete(state);
    return stateData.userId;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.get(`${this.graphUrl}/oauth/access_token`, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          code: code
        }
      });
      
      return response.data.access_token;
    } catch (error) {
      console.error('Token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for token');
    }
  }

  /**
   * Get user's Facebook pages
   */
  async getFacebookPages(accessToken) {
    try {
      const response = await axios.get(`${this.graphUrl}/me/accounts`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,access_token,instagram_business_account'
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('Get pages error:', error.response?.data || error.message);
      throw new Error('Failed to get Facebook pages');
    }
  }

  /**
   * Get Instagram account details
   */
  async getInstagramAccount(instagramBusinessAccountId, pageAccessToken) {
    try {
      const response = await axios.get(`${this.graphUrl}/${instagramBusinessAccountId}`, {
        params: {
          access_token: pageAccessToken,
          fields: 'id,username,name,profile_picture_url'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Get Instagram account error:', error.response?.data || error.message);
      throw new Error('Failed to get Instagram account details');
    }
  }

  /**
   * Handle OAuth callback and connect account
   */
  async handleCallback(code, state) {
    try {
      // 1. Verify state
      const userId = this.verifyState(state);
      
      // 2. Exchange code for short-lived token
      const shortLivedToken = await this.exchangeCodeForToken(code);
      
      // 3. Exchange short-lived for long-lived token
      const longLivedToken = await this.exchangeForLongLivedToken(shortLivedToken);
      
      // 4. Get user's Facebook pages
      const pages = await this.getFacebookPages(longLivedToken);
      
      // 5. Find pages with Instagram Business accounts
      const pagesWithInstagram = pages.filter(page => page.instagram_business_account);
      
      if (pagesWithInstagram.length === 0) {
        throw new Error('No Instagram Business account found. Please convert your Instagram account to a Business account and link it to a Facebook Page.');
      }
      
      // 6. Use the first Instagram account found
      const page = pagesWithInstagram[0];
      const instagramAccountId = page.instagram_business_account.id;
      
      // 7. Get Instagram account details
      const instagramAccount = await this.getInstagramAccount(
        instagramAccountId,
        page.access_token
      );
      
      // 8. Check if account already connected
      const existing = await prisma.socialAccount.findFirst({
        where: {
          userId: userId,
          platform: 'INSTAGRAM',
          platformUserId: instagramAccount.id
        }
      });
      
      if (existing) {
        // Update existing account
        return await prisma.socialAccount.update({
          where: { id: existing.id },
          data: {
            accessToken: page.access_token,
            platformUsername: instagramAccount.username,
            platformDisplayName: instagramAccount.name,
            profilePictureUrl: instagramAccount.profile_picture_url,
            status: 'ACTIVE',
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            metadata: {
              pageId: page.id,
              pageName: page.name
            }
          }
        });
      }
      
      // 9. Create new social account
      const socialAccount = await prisma.socialAccount.create({
        data: {
          userId: userId,
          platform: 'INSTAGRAM',
          platformUserId: instagramAccount.id,
          platformUsername: instagramAccount.username,
          platformDisplayName: instagramAccount.name,
          profilePictureUrl: instagramAccount.profile_picture_url,
          accessToken: page.access_token,
          status: 'ACTIVE',
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          metadata: {
            pageId: page.id,
            pageName: page.name
          }
        }
      });
      
      return socialAccount;
    } catch (error) {
      console.error('Instagram OAuth callback error:', error);
      throw error;
    }
  }

  /**
   * Exchange short-lived token for long-lived token
   */
  async exchangeForLongLivedToken(shortLivedToken) {
    try {
      const response = await axios.get(`${this.graphUrl}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          fb_exchange_token: shortLivedToken
        }
      });
      
      return response.data.access_token;
    } catch (error) {
      console.error('Long-lived token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to get long-lived token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(accountId) {
    try {
      const account = await prisma.socialAccount.findUnique({
        where: { id: accountId }
      });
      
      if (!account) {
        throw new Error('Account not found');
      }
      
      // Exchange current token for new long-lived token
      const newToken = await this.exchangeForLongLivedToken(account.accessToken);
      
      // Update account
      await prisma.socialAccount.update({
        where: { id: accountId },
        data: {
          accessToken: newToken,
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE'
        }
      });
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Mark account as expired
      await prisma.socialAccount.update({
        where: { id: accountId },
        data: {
          status: 'EXPIRED',
          errorMessage: error.message
        }
      });
      
      throw error;
    }
  }

  /**
   * Get Instagram Insights for a connected account
   * @param {string} accountId - socialAccount.id in DB
   * @param {Array<string>} metrics - array of metric names
   * @param {string} period - period string (day, week, days_28)
   */
  // accept optional since/until dates (YYYY-MM-DD) in ISO
  async getInsights(accountId, metrics = ['reach', 'profile_views', 'follower_count'], period = 'day', since, until) {
    // track if caller requested follower_count
    const needsFollower = metrics.includes('follower_count');

    // helper to ensure we can retry after refresh
    const doFetch = async (accessTokenToUse, igUserIdLocal) => {
      const results = [];
      // follower_count isn't available via /insights endpoint; we'll fetch it separately
      const metricsRequiringTotal = ['profile_views'];
      const totalMetrics = metrics.filter(m => metricsRequiringTotal.includes(m));
      const normalMetrics = metrics.filter(m => m !== 'follower_count' && !metricsRequiringTotal.includes(m));

      const baseParams = {
        access_token: accessTokenToUse,
        period: period
      };
      if (since) baseParams.since = since;
      if (until) baseParams.until = until;

      if (normalMetrics.length > 0) {
        const paramsNormal = {
          ...baseParams,
          metric: normalMetrics.join(',')
        };
        const respNormal = await axios.get(`${this.graphUrl}/${igUserIdLocal}/insights`, { params: paramsNormal });
        if (respNormal?.data?.data) results.push(...respNormal.data.data);
      }

      if (totalMetrics.length > 0) {
        const paramsTotal = {
          ...baseParams,
          metric: totalMetrics.join(','),
          metric_type: 'total_value'
        };
        const respTotal = await axios.get(`${this.graphUrl}/${igUserIdLocal}/insights`, { params: paramsTotal });
        if (respTotal?.data?.data) results.push(...respTotal.data.data);
      }

      return results;
    };

    try {
      const account = await prisma.socialAccount.findUnique({ where: { id: accountId } });

      if (!account) {
        throw new Error('Account not found');
      }

      const igUserId = account.platformUserId;
      if (!igUserId || igUserId.startsWith('manual-')) {
        throw new Error('Instagram user id is not set correctly for this account. Please ensure `platformUserId` stores the real Instagram Business user id (not a generated placeholder).');
      }
      let accessToken = account.accessToken;

      // attempt fetch; on token error, refresh once
      try {
        let data = await doFetch(accessToken, igUserId);
        if (needsFollower) {
          // fetch follower count separately
          try {
            const resp = await axios.get(`${this.graphUrl}/${igUserId}`, {
              params: {
                fields: 'followers_count',
                access_token: accessToken
              }
            });
            if (resp?.data?.followers_count !== undefined) {
              data.push({ name: 'follower_count', values: [{ value: resp.data.followers_count }] });
            }
          } catch (err) {
            console.warn('Failed to fetch follower_count:', err.response?.data || err.message);
          }
        }
        return { data };
      } catch (err) {
        const msg = err.response?.data || err.message;
        console.error('Insights fetch error during initial attempt:', msg);
        // look for expired/invalid token code 190
        if (msg && typeof msg === 'object' && msg.error && msg.error.code === 190) {
          console.log('Access token expired/invalid, refreshing...');
          await this.refreshToken(accountId);
          const updated = await prisma.socialAccount.findUnique({ where: { id: accountId } });
          accessToken = updated.accessToken;
          const data = await doFetch(accessToken, igUserId);
          return { data };
        }
        // rethrow if not token issue
        throw err;
      }
    } catch (error) {
      // log full error for debugging
      console.error('Get insights error:', error.response?.data || error.message || error);
      // rethrow original error so controller can inspect details
      throw error;
    }
  }
}

module.exports = new InstagramOAuthService();
