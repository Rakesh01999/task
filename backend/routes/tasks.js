const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper: Check if a date is in the past (yesterday or earlier)
const isPastDate = (dateString) => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // start of today
  return inputDate < today;
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      project, 
      status, 
      priority, 
      assignedMember, 
      deadlineStatus, 
      search, 
      sortBy,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Filter by Project
    if (project) {
      query.project = project;
    }

    // Filter by Status
    if (status) {
      query.status = status;
    }

    // Filter by Priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by Assigned Member
    if (assignedMember) {
      query.assignedMember = assignedMember === 'unassigned' ? null : assignedMember;
    }

    // Filter by Deadline Status
    if (deadlineStatus) {
      const today = new Date();
      if (deadlineStatus === 'overdue') {
        query.dueDate = { $lt: today };
        query.status = { $ne: 'Completed' }; // Completed tasks cannot be overdue
      } else if (deadlineStatus === 'upcoming') {
        query.dueDate = { $gte: today };
      }
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default: Latest Created
    if (sortBy) {
      switch (sortBy) {
        case 'nearestDeadline':
          sortOptions = { dueDate: 1 };
          break;
        case 'highestPriority':
          // Sort by high priority first: High -> Medium -> Low
          // We will sort this programmatically or we can use custom sort mapping
          // In MongoDB it's easier to sort by priority: High, Medium, Low using custom collation,
          // but for simplicity we will just sort alphabetically (High is H, Medium is M, Low is L... wait, H -> L -> M is not correct).
          // We will handle it by sorting alphabetically first or custom logic, 
          // let's do a simple sort by dueDate or let the frontend sort, or just sort by priority field.
          sortOptions = { priority: 1 }; // High, Low, Medium alphabetically
          break;
        case 'recentlyUpdated':
          sortOptions = { updatedAt: -1 };
          break;
        case 'latestCreated':
        default:
          sortOptions = { createdAt: -1 };
          break;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch tasks
    let tasks = await Task.find(query)
      .populate('project', 'name status')
      .populate('assignedMember', 'name email role avatarUrl')
      .populate('createdBy', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Handle custom priority sorting in JS if requested
    if (sortBy === 'highestPriority') {
      const priorityMap = { 'High': 1, 'Medium': 2, 'Low': 3 };
      tasks = tasks.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
    }

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status members')
      .populate('assignedMember', 'name email role avatarUrl')
      .populate('createdBy', 'name email role')
      .populate('comments.user', 'name email role avatarUrl');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin & PM only)
router.post('/', protect, authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    const { title, description, project, assignedMember, dueDate, priority, status } = req.body;

    // Rule 3: Prevent setting past dates as deadlines
    if (dueDate && isPastDate(dueDate)) {
      return res.status(400).json({ success: false, message: 'Please select a valid deadline.' });
    }

    // Rule 1: Prevent duplicate task titles inside the same project
    const duplicate = await Task.findOne({ project, title: { $regex: `^${title.trim()}$`, $options: 'i' } });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'This task already exists in the project.' });
    }

    // Verify project exists
    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ success: false, message: 'Associated project not found' });
    }

    // Create task
    const task = await Task.create({
      title: title.trim(),
      description,
      project,
      assignedMember: assignedMember || null,
      dueDate,
      priority: priority || 'Medium',
      status: status || 'Todo',
      createdBy: req.user.id,
    });

    // Create activity log
    let activityText = `Task "${task.title}" created in project "${proj.name}"`;
    if (assignedMember) {
      const user = await User.findById(assignedMember);
      if (user) {
        activityText += ` and assigned to ${user.name}`;
      }
    }
    await Activity.create({
      text: activityText,
      user: req.user.id,
      type: 'task_created',
      project: proj._id,
      task: task._id
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, description, assignedMember, dueDate, priority, status } = req.body;

    // RBAC: Team members can only update assigned tasks only, and only update status or add comments.
    if (req.user.role === 'Team Member') {
      const isAssigned = task.assignedMember && task.assignedMember.toString() === req.user.id;
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'Team Members can only update their assigned tasks.' });
      }

      // Block modification of title, description, dueDate, priority, assignee
      if (
        (title && title !== task.title) ||
        (description && description !== task.description) ||
        (assignedMember && assignedMember !== (task.assignedMember ? task.assignedMember.toString() : '')) ||
        (dueDate && new Date(dueDate).getTime() !== new Date(task.dueDate).getTime()) ||
        (priority && priority !== task.priority)
      ) {
        return res.status(403).json({ success: false, message: 'Team Members can only update the status of assigned tasks.' });
      }
    }

    // Rule 2: Prevent reassigning completed tasks ("Completed tasks cannot be reassigned.")
    // If the task status in the database is Completed, and we are attempting to change its assignee (assignedMember), block it.
    if (task.status === 'Completed') {
      const incomingAssignee = assignedMember !== undefined ? (assignedMember || null) : task.assignedMember;
      const currentAssignee = task.assignedMember ? task.assignedMember.toString() : null;
      const targetAssigneeId = incomingAssignee ? incomingAssignee.toString() : null;

      if (currentAssignee !== targetAssigneeId) {
        return res.status(400).json({ success: false, message: 'Completed tasks cannot be reassigned.' });
      }
    }

    // Rule 3: Prevent setting past dates as deadlines
    if (dueDate && new Date(dueDate).getTime() !== new Date(task.dueDate).getTime()) {
      if (isPastDate(dueDate)) {
        return res.status(400).json({ success: false, message: 'Please select a valid deadline.' });
      }
    }

    // Rule 1: Prevent duplicate task titles inside the same project
    if (title && title.trim().toLowerCase() !== task.title.toLowerCase()) {
      const duplicate = await Task.findOne({
        project: task.project,
        _id: { $ne: task._id },
        title: { $regex: `^${title.trim()}$`, $options: 'i' }
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'This task already exists in the project.' });
      }
    }

    // Log status or assignee changes
    let activityText = '';
    const oldStatus = task.status;
    const oldAssignee = task.assignedMember ? task.assignedMember.toString() : null;

    // Apply updates
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (assignedMember !== undefined) task.assignedMember = assignedMember || null;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;

    await task.save();

    // Populate task fields for logging/response
    const updatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedMember', 'name');

    if (status && status !== oldStatus) {
      if (status === 'Completed') {
        activityText = `Task "${updatedTask.title}" marked as Completed by ${req.user.name}`;
        await Activity.create({
          text: activityText,
          user: req.user.id,
          type: 'task_completed',
          project: task.project,
          task: task._id
        });
      } else {
        activityText = `Task "${updatedTask.title}" status changed to "${status}" by ${req.user.name}`;
        await Activity.create({
          text: activityText,
          user: req.user.id,
          type: 'task_updated',
          project: task.project,
          task: task._id
        });
      }
    }

    const newAssignee = task.assignedMember ? task.assignedMember.toString() : null;
    if (assignedMember !== undefined && newAssignee !== oldAssignee) {
      activityText = newAssignee 
        ? `Task "${updatedTask.title}" assigned to ${updatedTask.assignedMember.name} by ${req.user.name}`
        : `Task "${updatedTask.title}" unassigned by ${req.user.name}`;
      
      await Activity.create({
        text: activityText,
        user: req.user.id,
        type: 'task_assigned',
        project: task.project,
        task: task._id
      });
    }

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin & PM only)
router.delete('/:id', protect, authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const taskTitle = task.title;
    const projName = task.project ? task.project.name : '';
    const projId = task.project ? task.project._id : null;

    await Task.findByIdAndDelete(req.params.id);

    // Create activity log
    await Activity.create({
      text: `Task "${taskTitle}" deleted from project "${projName}" by ${req.user.name}`,
      user: req.user.id,
      type: 'task_deleted',
      project: projId,
    });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please add comment text' });
    }

    const comment = {
      user: req.user.id,
      text: text.trim(),
    };

    task.comments.push(comment);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name email role avatarUrl');

    res.json({ success: true, data: populatedTask.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Upload file attachment to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
router.post('/:id/attachments', protect, upload.single('file'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const attachment = {
      filename: req.file.originalname,
      filepath: `/uploads/${req.file.filename}`, // relative path for static serving
      filetype: req.file.mimetype,
    };

    task.attachments.push(attachment);
    await task.save();

    res.json({ success: true, data: task.attachments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
