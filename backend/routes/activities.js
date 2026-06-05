const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

// @desc    Get recent activity logs
// @route   GET /api/activities
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const activities = await Activity.find()
      .populate('user', 'name email role avatarUrl')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
