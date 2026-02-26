const express = require('express');
const router = express.Router();
const socialAccountsController = require('../controllers/social-accounts.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/social-accounts
 * @desc    Get all social accounts for current user
 * @access  Private
 */
router.get('/', authMiddleware, socialAccountsController.getSocialAccounts);

/**
 * @route   GET /api/social-accounts/instagram/auth-url
 * @desc    Get Instagram OAuth authorization URL
 * @access  Private
 */
router.get('/instagram/auth-url', authMiddleware, socialAccountsController.getInstagramAuthUrl);

/**
 * @route   GET /api/social-accounts/linkedin/auth-url
 * @desc    Get LinkedIn OAuth authorization URL
 * @access  Private
 */
router.get('/linkedin/auth-url', authMiddleware, socialAccountsController.getLinkedInAuthUrl);

/**
 * @route   DELETE /api/social-accounts/:id
 * @desc    Disconnect a social account
 * @access  Private
 */
router.delete('/:id', authMiddleware, socialAccountsController.disconnectAccount);

/**
 * @route   POST /api/social-accounts/:id/refresh
 * @desc    Refresh account access token
 * @access  Private
 */
router.post('/:id/refresh', authMiddleware, socialAccountsController.refreshAccountToken);

/**
 * @route   GET /api/social-accounts/:id/analytics
 * @desc    Get analytics for a connected social account
 * @access  Private
 */
router.get('/:id/analytics', authMiddleware, socialAccountsController.getAccountAnalytics);

module.exports = router;
