import mongoose, { Schema, Model } from 'mongoose';
import { IActivity } from '../types';

const ActivitySchema = new Schema<IActivity>({
  text: { type: String, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'project_created',
      'project_updated',
      'project_deleted',
      'task_created',
      'task_updated',
      'task_deleted',
      'task_assigned',
      'task_completed',
      'member_added',
    ],
    required: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Activity: Model<IActivity> = mongoose.model<IActivity>(
  'Activity',
  ActivitySchema
);
export default Activity;
