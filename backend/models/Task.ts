import mongoose, { Schema, Model } from 'mongoose';
import { ITask } from '../types';

const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
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

const AttachmentSchema = new Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  filetype: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
    },
    description: { type: String, trim: true },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignedMember: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Task: Model<ITask> = mongoose.model<ITask>('Task', TaskSchema);
export default Task;
