const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let projects;
    // Admins and PMs can see all projects. Team members can view all projects as per spec
    // but we will populate the members list
    projects = await Project.find()
      .populate('members', 'name email role avatarUrl')
      .populate('createdBy', 'name email role');

    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email role avatarUrl')
      .populate('createdBy', 'name email role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin & PM only)
router.post('/', protect, authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    const { name, description, deadline, status, members } = req.body;

    const project = await Project.create({
      name,
      description,
      deadline,
      status: status || 'Active',
      members: members || [],
      createdBy: req.user.id,
    });

    // Create activity log
    await Activity.create({
      text: `Project "${name}" created by ${req.user.name}`,
      user: req.user.id,
      type: 'project_created',
      project: project._id,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin & PM only)
router.put('/:id', protect, authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { name, description, deadline, status, members } = req.body;

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, deadline, status, members },
      { new: true, runValidators: true }
    );

    // Create activity log
    await Activity.create({
      text: `Project "${project.name}" details updated by ${req.user.name}`,
      user: req.user.id,
      type: 'project_updated',
      project: project._id,
    });

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin & PM only)
router.delete('/:id', protect, authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const projectName = project.name;

    // Delete project
    await Project.findByIdAndDelete(req.params.id);

    // Delete tasks under this project
    await Task.deleteMany({ project: req.params.id });

    // Create activity log
    await Activity.create({
      text: `Project "${projectName}" and its tasks deleted by ${req.user.name}`,
      user: req.user.id,
      type: 'project_deleted',
    });

    res.json({ success: true, message: 'Project and all associated tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin & PM only)
router.post('/:id/members', protect, authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { memberId } = req.body;
    
    // Check if member already in project
    if (project.members.includes(memberId)) {
      return res.status(400).json({ success: false, message: 'Member is already assigned to this project' });
    }

    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    project.members.push(memberId);
    await project.save();

    // Create activity log
    await Activity.create({
      text: `Member "${user.name}" added to "${project.name}" by ${req.user.name}`,
      user: req.user.id,
      type: 'member_added',
      project: project._id,
    });

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
