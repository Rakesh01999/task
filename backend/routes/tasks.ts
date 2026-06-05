import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Task from '../models/Task';
import Project from '../models/Project';
import Activity from '../models/Activity';
import User from '../models/User';
import { protect, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper: Check if a date is in the past (yesterday or earlier)
const isPastDate = (dateString: string): boolean => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const {
      project,
      status,
      priority,
      assignedMember,
      deadlineStatus,
      search,
      sortBy,
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};

    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedMember) {
      query.assignedMember = assignedMember === 'unassigned' ? null : assignedMember;
    }

    if (deadlineStatus) {
      const today = new Date();
      if (deadlineStatus === 'overdue') {
        query.dueDate = { $lt: today };
        query.status = { $ne: 'Completed' };
      } else if (deadlineStatus === 'upcoming') {
        query.dueDate = { $gte: today };
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'nearestDeadline':
          sortOptions = { dueDate: 1 };
          break;
        case 'highestPriority':
          sortOptions = { priority: 1 };
          break;
        case 'recentlyUpdated':
          sortOptions = { updatedAt: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let tasks = await Task.find(query)
      .populate('project', 'name status')
      .populate('assignedMember', 'name email role avatarUrl')
      .populate('createdBy', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit, 10));

    if (sortBy === 'highestPriority') {
      const priorityMap: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
      tasks = tasks.sort(
        (a, b) => (priorityMap[a.priority] ?? 99) - (priorityMap[b.priority] ?? 99)
      );
    }

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status members')
      .populate('assignedMember', 'name email role avatarUrl')
      .populate('createdBy', 'name email role')
      .populate('comments.user', 'name email role avatarUrl');

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin & PM only)
router.post(
  '/',
  protect,
  authorize('Admin', 'Project Manager'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, project, assignedMember, dueDate, priority, status } =
        req.body as {
          title: string;
          description?: string;
          project: string;
          assignedMember?: string;
          dueDate: string;
          priority?: string;
          status?: string;
        };

      if (dueDate && isPastDate(dueDate)) {
        res.status(400).json({ success: false, message: 'Please select a valid deadline.' });
        return;
      }

      const duplicate = await Task.findOne({
        project,
        title: { $regex: `^${title.trim()}$`, $options: 'i' },
      });
      if (duplicate) {
        res.status(400).json({ success: false, message: 'This task already exists in the project.' });
        return;
      }

      const proj = await Project.findById(project);
      if (!proj) {
        res.status(404).json({ success: false, message: 'Associated project not found' });
        return;
      }

      const task = await Task.create({
        title: title.trim(),
        description,
        project,
        assignedMember: assignedMember || null,
        dueDate,
        priority: priority || 'Medium',
        status: status || 'Todo',
        createdBy: req.user!.id,
      });

      let activityText = `Task "${task.title}" created in project "${proj.name}"`;
      if (assignedMember) {
        const user = await User.findById(assignedMember);
        if (user) activityText += ` and assigned to ${user.name}`;
      }

      await Activity.create({
        text: activityText,
        user: req.user!.id,
        type: 'task_created',
        project: proj._id,
        task: task._id,
      });

      res.status(201).json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
);

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const { title, description, assignedMember, dueDate, priority, status } = req.body as {
      title?: string;
      description?: string;
      assignedMember?: string | null;
      dueDate?: string;
      priority?: string;
      status?: string;
    };

    // RBAC: Team members can only update status of their assigned tasks
    if (req.user!.role === 'Team Member') {
      const assignedId = task.assignedMember ? task.assignedMember.toString() : null;
      if (assignedId !== req.user!.id.toString()) {
        res.status(403).json({ success: false, message: 'Team Members can only update their assigned tasks.' });
        return;
      }
      if (
        (title && title !== task.title) ||
        (description && description !== task.description) ||
        (assignedMember !== undefined && assignedMember !== assignedId) ||
        (dueDate && new Date(dueDate).getTime() !== new Date(task.dueDate).getTime()) ||
        (priority && priority !== task.priority)
      ) {
        res.status(403).json({ success: false, message: 'Team Members can only update the status of assigned tasks.' });
        return;
      }
    }

    // Rule 2: Prevent reassigning completed tasks
    if (task.status === 'Completed') {
      const currentAssignee = task.assignedMember ? task.assignedMember.toString() : null;
      const targetAssignee = assignedMember !== undefined ? (assignedMember || null) : currentAssignee;
      if (currentAssignee !== (targetAssignee?.toString() ?? null)) {
        res.status(400).json({ success: false, message: 'Completed tasks cannot be reassigned.' });
        return;
      }
    }

    // Rule 3: Prevent past deadlines
    if (dueDate && new Date(dueDate).getTime() !== new Date(task.dueDate).getTime()) {
      if (isPastDate(dueDate)) {
        res.status(400).json({ success: false, message: 'Please select a valid deadline.' });
        return;
      }
    }

    // Rule 1: Prevent duplicate titles
    if (title && title.trim().toLowerCase() !== task.title.toLowerCase()) {
      const duplicate = await Task.findOne({
        project: task.project,
        _id: { $ne: task._id },
        title: { $regex: `^${title.trim()}$`, $options: 'i' },
      });
      if (duplicate) {
        res.status(400).json({ success: false, message: 'This task already exists in the project.' });
        return;
      }
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignedMember ? task.assignedMember.toString() : null;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (assignedMember !== undefined) task.assignedMember = assignedMember ? (assignedMember as unknown as import('mongoose').Types.ObjectId) : null;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (priority !== undefined) task.priority = priority as import('../types').TaskPriority;
    if (status !== undefined) task.status = status as import('../types').TaskStatus;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedMember', 'name');

    if (status && status !== oldStatus) {
      const activityType = status === 'Completed' ? 'task_completed' : 'task_updated';
      const activityText =
        status === 'Completed'
          ? `Task "${updatedTask!.title}" marked as Completed by ${req.user!.name}`
          : `Task "${updatedTask!.title}" status changed to "${status}" by ${req.user!.name}`;
      await Activity.create({
        text: activityText,
        user: req.user!.id,
        type: activityType,
        project: task.project,
        task: task._id,
      });
    }

    const newAssignee = task.assignedMember ? task.assignedMember.toString() : null;
    if (assignedMember !== undefined && newAssignee !== oldAssignee) {
      const assignedUser = updatedTask?.assignedMember as unknown as { name: string } | null;
      const activityText = newAssignee
        ? `Task "${updatedTask!.title}" assigned to ${assignedUser?.name} by ${req.user!.name}`
        : `Task "${updatedTask!.title}" unassigned by ${req.user!.name}`;
      await Activity.create({
        text: activityText,
        user: req.user!.id,
        type: 'task_assigned',
        project: task.project,
        task: task._id,
      });
    }

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin & PM only)
router.delete(
  '/:id',
  protect,
  authorize('Admin', 'Project Manager'),
  async (req: AuthRequest, res: Response) => {
    try {
      const task = await Task.findById(req.params.id).populate('project', 'name');
      if (!task) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      const taskTitle = task.title;
      const proj = task.project as unknown as { name: string; _id: string } | null;

      await Task.findByIdAndDelete(req.params.id);

      await Activity.create({
        text: `Task "${taskTitle}" deleted from project "${proj?.name ?? ''}" by ${req.user!.name}`,
        user: req.user!.id,
        type: 'task_deleted',
        project: proj?._id ?? null,
      });

      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
);

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
router.post('/:id/comments', protect, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const { text } = req.body as { text: string };
    if (!text || text.trim() === '') {
      res.status(400).json({ success: false, message: 'Please add comment text' });
      return;
    }

    task.comments.push({ user: req.user!._id, text: text.trim(), createdAt: new Date() });
    await task.save();

    const populatedTask = await Task.findById(task._id).populate(
      'comments.user',
      'name email role avatarUrl'
    );

    res.json({ success: true, data: populatedTask!.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Upload file attachment to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
router.post(
  '/:id/attachments',
  protect,
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Please upload a file' });
        return;
      }

      task.attachments.push({
        filename: req.file.originalname,
        filepath: `/uploads/${req.file.filename}`,
        filetype: req.file.mimetype,
        uploadedAt: new Date(),
      });
      await task.save();

      res.json({ success: true, data: task.attachments });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
);

export default router;
