const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline date'],
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'On Hold'],
    default: 'Active',
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Project', ProjectSchema);
