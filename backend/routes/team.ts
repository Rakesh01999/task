import express, { Response } from 'express';
import User from '../models/User';
import Task from '../models/Task';
import { protect, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

// @desc    Get all team members
// @route   GET /api/team
// @access  Private
router.get('/', protect, async (_req: AuthRequest, res: Response) => {
  try {
    const members = await User.find().select('-password');
    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Create/Add a new team member
// @route   POST /api/team
// @access  Private (Admin only)
router.post('/', protect, authorize('Admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role?: string;
    };

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
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
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Get workload summary for all team members
// @route   GET /api/team/workload
// @access  Private
router.get('/workload', protect, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('name email role avatarUrl');
    const workloadSummary = [];

    for (const user of users) {
      const totalTasks = await Task.countDocuments({ assignedMember: user._id });
      const completedTasks = await Task.countDocuments({ assignedMember: user._id, status: 'Completed' });
      const pendingTasks = await Task.countDocuments({ assignedMember: user._id, status: { $ne: 'Completed' } });

      workloadSummary.push({ member: user, totalTasks, completedTasks, pendingTasks });
    }

    res.json({ success: true, data: workloadSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
