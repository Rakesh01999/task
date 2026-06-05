const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all team members
// @route   GET /api/team
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const members = await User.find().select('-password');
    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create/Add a new team member
// @route   POST /api/team
// @access  Private (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const member = await User.create({
      name,
      email,
      password,
      role: role || 'Team Member',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    });

    res.status(201).json({
      success: true,
      data: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        avatarUrl: member.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get workload summary for all team members
// @route   GET /api/team/workload
// @access  Private
router.get('/workload', protect, async (req, res) => {
  try {
    const users = await User.find().select('name email role avatarUrl');
    const workloadSummary = [];

    for (let user of users) {
      // Count total tasks
      const totalTasks = await Task.countDocuments({ assignedMember: user._id });
      // Count completed tasks
      const completedTasks = await Task.countDocuments({ assignedMember: user._id, status: 'Completed' });
      // Count pending tasks
      const pendingTasks = await Task.countDocuments({ assignedMember: user._id, status: { $ne: 'Completed' } });

      workloadSummary.push({
        member: user,
        totalTasks,
        completedTasks,
        pendingTasks,
      });
    }

    res.json({ success: true, data: workloadSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
