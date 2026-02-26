const { PrismaClient } = require('@prisma/client');
const instagramOAuth = require('../services/instagram-oauth.service');
const linkedinOAuth = require('../services/linkedin-oauth.service');

const prisma = new PrismaClient();

/**
 * Get all social accounts for current user
 * GET /api/social-accounts
 */
const getSocialAccounts = async (req, res) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        platform: true,
        platformUserId: true,
        platformUsername: true,
        platformDisplayName: true,
        profilePictureUrl: true,
        status: true,
        tokenExpiresAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ accounts });
  } catch (error) {
    console.error('Get social accounts error:', error);
    res.status(500).json({ error: 'Failed to get social accounts' });
  }
};

/**
 * Get Instagram OAuth URL
 * GET /api/social-accounts/instagram/auth-url
 */
const getInstagramAuthUrl = async (req, res) => {
  try {
    const authUrl = instagramOAuth.getAuthUrl(req.user.id);
    res.json({ authUrl });
  } catch (error) {
    console.error('Get Instagram auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

/**
 * Get LinkedIn OAuth URL
 * GET /api/social-accounts/linkedin/auth-url
 */
const getLinkedInAuthUrl = async (req, res) => {
  try {
    const authUrl = linkedinOAuth.getAuthUrl(req.user.id);
    res.json({ authUrl });
  } catch (error) {
    console.error('Get LinkedIn auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

/**
 * Handle Instagram OAuth callback
 * GET /api/oauth/instagram/callback
 */
const handleInstagramCallback = async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;
    
    // Check for OAuth errors
    if (error) {
      console.error('Instagram OAuth error:', error, error_description);
      return res.redirect(`${process.env.FRONTEND_URL}/settings/social-accounts?error=${encodeURIComponent(error_description || error)}`);
    }
    
    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings/social-accounts?error=missing_parameters`);
    }
    
    // Handle OAuth callback
    await instagramOAuth.handleCallback(code, state);
    
    // Redirect to success page
    res.redirect(`${process.env.FRONTEND_URL}/settings/social-accounts?success=instagram_connected`);
  } catch (error) {
    console.error('Instagram callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings/social-accounts?error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Handle LinkedIn OAuth callback
 * GET /api/oauth/linkedin/callback
 */
const handleLinkedInCallback = async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;
    
    // Check for OAuth errors
    if (error) {
      console.error('LinkedIn OAuth error:', error, error_description);
      return res.redirect(`${process.env.FRONTEND_URL}/settings/social-accounts?error=${encodeURIComponent(error_description || error)}`);
    }
    
    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings/social-accounts?error=missing_parameters`);
    }
    
    // Handle OAuth callback
    await linkedinOAuth.handleCallback(code, state);
    
    // Redirect to success page
    res.redirect(`${process.env.FRONTEND_URL}/settings/social-accounts?success=linkedin_connected`);
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings/social-accounts?error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Disconnect social account
 * DELETE /api/social-accounts/:id
 */
const disconnectAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify account belongs to user
    const account = await prisma.socialAccount.findFirst({
      where: {
        id: id,
        userId: req.user.id
      }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Delete account
    await prisma.socialAccount.delete({
      where: { id: id }
    });
    
    res.json({ message: 'Account disconnected successfully' });
  } catch (error) {
    console.error('Disconnect account error:', error);
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
};

/**
 * Refresh account token
 * POST /api/social-accounts/:id/refresh
 */
const refreshAccountToken = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify account belongs to user
    const account = await prisma.socialAccount.findFirst({
      where: {
        id: id,
        userId: req.user.id
      }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Refresh token based on platform
    if (account.platform === 'INSTAGRAM') {
      await instagramOAuth.refreshToken(id);
    } else if (account.platform === 'LINKEDIN') {
      await linkedinOAuth.refreshToken(id);
    } else {
      return res.status(400).json({ error: 'Unsupported platform' });
    }
    
    // Get updated account
    const updatedAccount = await prisma.socialAccount.findUnique({
      where: { id: id },
      select: {
        id: true,
        platform: true,
        platformUsername: true,
        status: true,
        tokenExpiresAt: true
      }
    });
    
    res.json({
      message: 'Token refreshed successfully',
      account: updatedAccount
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: error.message || 'Failed to refresh token' });
  }
};

/**
 * Get analytics for a specific connected account
 * GET /api/social-accounts/:id/analytics
 */
const getAccountAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify account belongs to user
    const account = await prisma.socialAccount.findFirst({
      where: { id: id, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.platform === 'INSTAGRAM') {
      const { since, until } = req.query;
      const insights = await instagramOAuth.getInsights(id, undefined, undefined, since, until);
      return res.json({ insights });
    }

    return res.status(400).json({ error: 'Analytics not supported for this platform' });
  } catch (error) {
    console.error('Get account analytics error:', error.response?.data || error.message || error);
    // include Graph API response if present for debugging
    const detail = error.response?.data || null;
    res.status(500).json({ error: error.message || 'Failed to get analytics', detail });
  }
};

module.exports = {
  getSocialAccounts,
  getInstagramAuthUrl,
  getLinkedInAuthUrl,
  handleInstagramCallback,
  handleLinkedInCallback,
  disconnectAccount,
  refreshAccountToken
  , getAccountAnalytics
};
