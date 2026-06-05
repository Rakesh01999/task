const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['project_created', 'project_updated', 'project_deleted', 'task_created', 'task_updated', 'task_deleted', 'task_assigned', 'task_completed', 'member_added'],
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Activity', ActivitySchema);
