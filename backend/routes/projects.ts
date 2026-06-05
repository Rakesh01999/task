import express, { Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import Activity from '../models/Activity';
import User from '../models/User';
import { protect, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find()
      .populate('members', 'name email role avatarUrl')
      .populate('createdBy', 'name email role');
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email role avatarUrl')
      .populate('createdBy', 'name email role');

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin & PM only)
router.post(
  '/',
  protect,
  authorize('Admin', 'Project Manager'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, description, deadline, status, members } = req.body as {
        name: string;
        description?: string;
        deadline: string;
        status?: string;
        members?: string[];
      };

      const project = await Project.create({
        name,
        description,
        deadline,
        status: status || 'Active',
        members: members || [],
        createdBy: req.user!.id,
      });

      await Activity.create({
        text: `Project "${name}" created by ${req.user!.name}`,
        user: req.user!.id,
        type: 'project_created',
        project: project._id,
      });

      res.status(201).json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
);

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin & PM only)
router.put(
  '/:id',
  protect,
  authorize('Admin', 'Project Manager'),
  async (req: AuthRequest, res: Response) => {
    try {
      let project = await Project.findById(req.params.id);
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      const { name, description, deadline, status, members } = req.body;

      project = await Project.findByIdAndUpdate(
        req.params.id,
        { name, description, deadline, status, members },
        { new: true, runValidators: true }
      );

      await Activity.create({
        text: `Project "${project!.name}" details updated by ${req.user!.name}`,
        user: req.user!.id,
        type: 'project_updated',
        project: project!._id,
      });

      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
);

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin & PM only)
router.delete(
  '/:id',
  protect,
  authorize('Admin', 'Project Manager'),
  async (req: AuthRequest, res: Response) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      const projectName = project.name;
      await Project.findByIdAndDelete(req.params.id);
      await Task.deleteMany({ project: req.params.id });

      await Activity.create({
        text: `Project "${projectName}" and its tasks deleted by ${req.user!.name}`,
        user: req.user!.id,
        type: 'project_deleted',
      });

      res.json({ success: true, message: 'Project and all associated tasks deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
);

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin & PM only)
router.post(
  '/:id/members',
  protect,
  authorize('Admin', 'Project Manager'),
  async (req: AuthRequest, res: Response) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      const { memberId } = req.body as { memberId: string };

      if (project.members.map(String).includes(memberId)) {
        res.status(400).json({ success: false, message: 'Member is already assigned to this project' });
        return;
      }

      const user = await User.findById(memberId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      project.members.push(user._id);
      await project.save();

      await Activity.create({
        text: `Member "${user.name}" added to "${project.name}" by ${req.user!.name}`,
        user: req.user!.id,
        type: 'member_added',
        project: project._id,
      });

      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
);

export default router;
