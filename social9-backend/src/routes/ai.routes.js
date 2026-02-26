const express = require('express');
const router = express.Router();
const { generateInsights } = require('../controllers/ai.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', (req, res) => { res.json({ message: 'ai routes - Coming soon' }); });

// POST /api/ai/insights (protected)
router.post('/insights', authMiddleware, generateInsights);

module.exports = router;
