import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Route Files
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import teamRoutes from './routes/team';
import activityRoutes from './routes/activities';

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/activities', activityRoutes);

// Health Check Route
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running perfectly' });
});

// Auto-seed Database if empty
import User from './models/User';
import Project from './models/Project';
import Task from './models/Task';
import Activity from './models/Activity';

const autoSeed = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Auto-seeding default demo data...');

      const admin = await User.create({
        name: 'Sarah Connor (Admin)',
        email: 'admin@system.com',
        password: 'password123',
        role: 'Admin',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
      });

      const pm = await User.create({
        name: 'John Doe (PM)',
        email: 'pm@system.com',
        password: 'password123',
        role: 'Project Manager',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=John',
      });

      const member1 = await User.create({
        name: 'Alice Smith',
        email: 'member@system.com',
        password: 'password123',
        role: 'Team Member',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice',
      });

      const member2 = await User.create({
        name: 'Bob Johnson',
        email: 'bob@system.com',
        password: 'password123',
        role: 'Team Member',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bob',
      });

      const p1 = await Project.create({
        name: 'Website Redesign',
        description: 'Migrating the company website to a modern look and feel, improving user experience and load speed.',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'Active',
        members: [pm._id, member1._id, member2._id],
        createdBy: admin._id,
      });

      const p2 = await Project.create({
        name: 'Mobile App Development',
        description: 'Building cross-platform iOS and Android apps using React Native.',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'Active',
        members: [pm._id, member1._id],
        createdBy: pm._id,
      });

      const p3 = await Project.create({
        name: 'Admin Dashboard',
        description: 'Internal analytical tools and control panels for system administrators.',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'On Hold',
        members: [admin._id, pm._id, member2._id],
        createdBy: admin._id,
      });

      await Task.create({
        title: 'Setup API Integration',
        description: 'Link Next.js endpoints with Express backend, configure cors and request methods.',
        project: p1._id,
        assignedMember: member1._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'High',
        status: 'In Progress',
        createdBy: pm._id,
      });

      await Task.create({
        title: 'Design Homepage UI Mockup',
        description: 'Create Figma designs and layouts for the primary landing page.',
        project: p1._id,
        assignedMember: member2._id,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        status: 'Completed',
        createdBy: pm._id,
        comments: [
          { user: pm._id, text: 'Figma mockup finalized. Ready to implement.' },
          { user: member2._id, text: 'Awesome, starting HTML/Tailwind conversion.' },
        ],
      });

      await Task.create({
        title: 'SEO Audit',
        description: 'Perform meta tags, headings, and description enhancements on website headers.',
        project: p1._id,
        assignedMember: member1._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priority: 'Low',
        status: 'Todo',
        createdBy: pm._id,
      });

      await Task.create({
        title: 'App Store Submission Prep',
        description: 'Generate developer credentials and compile metadata files.',
        project: p2._id,
        assignedMember: member1._id,
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        priority: 'High',
        status: 'Todo',
        createdBy: pm._id,
      });

      await Task.create({
        title: 'Audit Logs Database Cleanup',
        description: 'Create cron job to archive older logs after 30 days.',
        project: p3._id,
        assignedMember: member2._id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        status: 'Todo',
        createdBy: admin._id,
      });

      await Activity.insertMany([
        { text: `Project "Website Redesign" created`, user: admin._id, type: 'project_created', project: p1._id, createdAt: new Date(Date.now() - 60 * 60 * 1000) },
        { text: `Task "Setup API Integration" assigned to Alice Smith`, user: pm._id, type: 'task_assigned', project: p1._id, createdAt: new Date(Date.now() - 45 * 60 * 1000) },
        { text: `Task "Design Homepage UI Mockup" marked as Completed`, user: member2._id, type: 'task_completed', project: p1._id, createdAt: new Date(Date.now() - 30 * 60 * 1000) },
        { text: `Member "Bob Johnson" added to "Admin Dashboard"`, user: admin._id, type: 'member_added', project: p3._id, createdAt: new Date(Date.now() - 15 * 60 * 1000) },
      ]);

      console.log('Database successfully seeded with demo mock data.');
    }
  } catch (err) {
    console.error('Error during auto-seeding:', (err as Error).message);
  }
};

// Start Server & Run Auto-seed
const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, async () => {
  console.log(`Server running in development mode on port ${PORT}`);
  await autoSeed();
});
