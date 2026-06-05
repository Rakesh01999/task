import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ─── User ───────────────────────────────────────────────────────────────────

export type UserRole = 'Admin' | 'Project Manager' | 'Team Member';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// ─── Project ─────────────────────────────────────────────────────────────────

export type ProjectStatus = 'Active' | 'Completed' | 'On Hold';

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  deadline: Date;
  status: ProjectStatus;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface IComment {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IAttachment {
  filename: string;
  filepath: string;
  filetype?: string;
  uploadedAt: Date;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  project: Types.ObjectId;
  assignedMember?: Types.ObjectId | null;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  comments: IComment[];
  attachments: IAttachment[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export type ActivityType =
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_assigned'
  | 'task_completed'
  | 'member_added';

export interface IActivity extends Document {
  _id: Types.ObjectId;
  text: string;
  user: Types.ObjectId;
  type: ActivityType;
  project?: Types.ObjectId | null;
  task?: Types.ObjectId | null;
  createdAt: Date;
}

// ─── Auth Request ─────────────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: IUser;
}
