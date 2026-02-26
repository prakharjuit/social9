const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Store OAuth states temporarily (in production, use Redis)
const oauthStates = new Map();

class LinkedInOAuthService {
  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    this.authUrl = 'https://www.linkedin.com/oauth/v2/authorization';
    this.tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    this.apiUrl = 'https://api.linkedin.com/v2';
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
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state,
      scope: 'openid profile email'
    });
    
    const url = `${this.authUrl}?${params.toString()}`;
    console.log('LinkedIn OAuth URL generated:', url);
    return url;
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
      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
        refreshToken: response.data.refresh_token
      };
    } catch (error) {
      console.error('LinkedIn token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for token');
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(`${this.apiUrl}/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('LinkedIn profile error:', error.response?.data || error.message);
      throw new Error('Failed to get LinkedIn profile');
    }
  }

  /**
   * Handle OAuth callback and connect account
   */
  async handleCallback(code, state) {
    try {
      // 1. Verify state
      const userId = this.verifyState(state);
      
      // 2. Exchange code for access token
      const tokenData = await this.exchangeCodeForToken(code);
      
      // 3. Get user profile
      const profile = await this.getUserProfile(tokenData.accessToken);
      
      // 4. Check if account already connected
      const existing = await prisma.socialAccount.findFirst({
        where: {
          userId: userId,
          platform: 'LINKEDIN',
          platformUserId: profile.sub
        }
      });
      
      if (existing) {
        // Update existing account
        return await prisma.socialAccount.update({
          where: { id: existing.id },
          data: {
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            platformUsername: profile.email,
            platformDisplayName: profile.name,
            profilePictureUrl: profile.picture,
            status: 'ACTIVE',
            tokenExpiresAt: new Date(Date.now() + tokenData.expiresIn * 1000),
            metadata: {
              email: profile.email,
              emailVerified: profile.email_verified
            }
          }
        });
      }
      
      // 5. Create new social account
      const socialAccount = await prisma.socialAccount.create({
        data: {
          userId: userId,
          platform: 'LINKEDIN',
          platformUserId: profile.sub,
          platformUsername: profile.email,
          platformDisplayName: profile.name,
          profilePictureUrl: profile.picture,
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          status: 'ACTIVE',
          tokenExpiresAt: new Date(Date.now() + tokenData.expiresIn * 1000),
          metadata: {
            email: profile.email,
            emailVerified: profile.email_verified
          }
        }
      });
      
      return socialAccount;
    } catch (error) {
      console.error('LinkedIn OAuth callback error:', error);
      throw error;
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
      
      if (!account || !account.refreshToken) {
        throw new Error('Account not found or no refresh token');
      }
      
      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: account.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      // Update account with new token
      await prisma.socialAccount.update({
        where: { id: accountId },
        data: {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token || account.refreshToken,
          tokenExpiresAt: new Date(Date.now() + response.data.expires_in * 1000),
          status: 'ACTIVE'
        }
      });
      
      return true;
    } catch (error) {
      console.error('LinkedIn token refresh error:', error);
      
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
}

module.exports = new LinkedInOAuthService();
