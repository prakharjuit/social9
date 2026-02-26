const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../utils/jwt');

const prisma = new PrismaClient();

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided. Please login.'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid or expired token. Please login again.'
      });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        businessName: true,
        businessType: true,
        businessLocation: true,
        planType: true,
        subscriptionStatus: true,
        postsThisMonth: true,
        aiUsageThisMonth: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found. Please login again.'
      });
    }
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication failed'
    });
  }
};

/**
 * Optional auth middleware
 * Attaches user if token exists, but doesn't require it
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });
        
        if (user) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Don't block request if optional auth fails
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
