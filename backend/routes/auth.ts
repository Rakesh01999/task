import express, { Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';
import Activity from '../models/Activity';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

const generateToken = (id: string): string => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_token_key',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role?: string;
    };

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Team Member',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    res.json({
      success: true,
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Seed/Reset database with pre-filled mock data
// @route   POST /api/auth/seed
// @access  Public
router.post('/seed', async (_req: AuthRequest, res: Response) => {
  try {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Activity.deleteMany({});

    const admin = await User.create({
      name: 'Sarah Connor (Admin)',
      email: 'admin@system.com',
      password: 'password123',
      role: 'Admin',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
    });

    const pm = await User.create({
      name: 'John Doe (PM)',
      email: 'pm@system.com',
      password: 'password123',
      role: 'Project Manager',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=John',
    });

    const member1 = await User.create({
      name: 'Alice Smith',
      email: 'member@system.com',
      password: 'password123',
      role: 'Team Member',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice',
    });

    const member2 = await User.create({
      name: 'Bob Johnson',
      email: 'bob@system.com',
      password: 'password123',
      role: 'Team Member',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bob',
    });

    const p1 = await Project.create({
      name: 'Website Redesign',
      description: 'Migrating the company website to a modern look and feel.',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'Active',
      members: [pm._id, member1._id, member2._id],
      createdBy: admin._id,
    });

    const p2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Building cross-platform iOS and Android apps using React Native.',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'Active',
      members: [pm._id, member1._id],
      createdBy: pm._id,
    });

    const p3 = await Project.create({
      name: 'Admin Dashboard',
      description: 'Internal analytical tools and control panels.',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'On Hold',
      members: [admin._id, pm._id, member2._id],
      createdBy: admin._id,
    });

    await Task.create({
      title: 'Setup API Integration',
      description: 'Link Next.js endpoints with Express backend.',
      project: p1._id,
      assignedMember: member1._id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: 'High',
      status: 'In Progress',
      createdBy: pm._id,
    });

    await Task.create({
      title: 'Design Homepage UI Mockup',
      description: 'Create Figma designs for the primary landing page.',
      project: p1._id,
      assignedMember: member2._id,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      priority: 'Medium',
      status: 'Completed',
      createdBy: pm._id,
      comments: [
        { user: pm._id, text: 'Figma mockup finalized. Ready to implement.' },
        { user: member2._id, text: 'Awesome, starting HTML/Tailwind conversion.' },
      ],
    });

    await Task.create({
      title: 'SEO Audit',
      description: 'Perform meta tags, headings, and description enhancements.',
      project: p1._id,
      assignedMember: member1._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: 'Low',
      status: 'Todo',
      createdBy: pm._id,
    });

    await Task.create({
      title: 'App Store Submission Prep',
      description: 'Generate developer credentials and compile metadata files.',
      project: p2._id,
      assignedMember: member1._id,
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      priority: 'High',
      status: 'Todo',
      createdBy: pm._id,
    });

    await Task.create({
      title: 'Audit Logs Database Cleanup',
      description: 'Create cron job to archive older logs after 30 days.',
      project: p3._id,
      assignedMember: member2._id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      priority: 'Medium',
      status: 'Todo',
      createdBy: admin._id,
    });

    await Activity.insertMany([
      { text: `Project "Website Redesign" created`, user: admin._id, type: 'project_created', project: p1._id, createdAt: new Date(Date.now() - 60 * 60 * 1000) },
      { text: `Task "Setup API Integration" assigned to Alice Smith`, user: pm._id, type: 'task_assigned', project: p1._id, createdAt: new Date(Date.now() - 45 * 60 * 1000) },
      { text: `Task "Design Homepage UI Mockup" marked as Completed`, user: member2._id, type: 'task_completed', project: p1._id, createdAt: new Date(Date.now() - 30 * 60 * 1000) },
      { text: `Member "Bob Johnson" added to "Admin Dashboard"`, user: admin._id, type: 'member_added', project: p3._id, createdAt: new Date(Date.now() - 15 * 60 * 1000) },
    ]);

    res.json({ success: true, message: 'Database successfully seeded with demo mock data.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
