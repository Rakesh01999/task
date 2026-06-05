import express, { Response } from 'express';
import Activity from '../models/Activity';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

// @desc    Get recent activity logs
// @route   GET /api/activities
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '15', 10);
    const activities = await Activity.find()
      .populate('user', 'name email role avatarUrl')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
