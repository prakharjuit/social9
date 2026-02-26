// Simple rule-based insights without external AI

/**
 * POST /api/ai/insights
 * body: { metrics: { name: value, ... } }
 * returns: { insights: string }
 */
const generateInsights = async (req, res) => {
  try {
    const { metrics } = req.body;

    if (!metrics || typeof metrics !== 'object') {
      return res.status(400).json({ error: 'metrics object required' });
    }

    // simple summary
    const parts = [];
    if (metrics.reach !== undefined) parts.push(`Reach: ${metrics.reach}`);
    if (metrics.profile_views !== undefined) parts.push(`Profile views: ${metrics.profile_views}`);
    if (metrics.follower_count !== undefined) parts.push(`Followers: ${metrics.follower_count}`);
    const summary = parts.join(', ') || 'No metrics available.';

    // basic recommendations
    const recs = [];
    if (metrics.reach !== undefined && metrics.reach < 1000) {
      recs.push('Post more frequently to boost reach');
    }
    if (metrics.profile_views !== undefined && metrics.profile_views < 100) {
      recs.push('Engage with users by responding to comments');
    }
    if (metrics.follower_count !== undefined) {
      recs.push('Use relevant hashtags to attract new followers');
    }
    if (recs.length === 0) {
      recs.push('Keep up the good work and monitor trends');
    }

    const insightsText = `Summary: ${summary}.\nRecommendations:\n- ${recs.join('\n- ')}`;

    res.json({ insights: insightsText });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
};

module.exports = { generateInsights };
