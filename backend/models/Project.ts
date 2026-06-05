import mongoose, { Schema, Model } from 'mongoose';
import { IProject } from '../types';

const ProjectSchema = new Schema<IProject>(
  {
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
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Project: Model<IProject> = mongoose.model<IProject>(
  'Project',
  ProjectSchema
);
export default Project;
