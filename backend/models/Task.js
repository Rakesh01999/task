const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Please add a comment text'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AttachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  filepath: {
    type: String,
    required: true,
  },
  filetype: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  assignedMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date'],
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Completed'],
    default: 'Todo',
  },
  comments: [CommentSchema],
  attachments: [AttachmentSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', TaskSchema);
