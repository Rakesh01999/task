'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { projectsAPI, tasksAPI, teamAPI, activitiesAPI } from '../../lib/api';
import { showToast } from '../../store/appSlice';
import { 
  Folder, 
  ListTodo, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  UserCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function DashboardView({ onViewChange }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workloads, setWorkloads] = useState([]);
  const [activities, setActivities] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes, workloadRes, actRes] = await Promise.all([
        projectsAPI.getAll(),
        tasksAPI.getAll({ limit: 100 }), // fetch a large chunk for computing stats
        teamAPI.getWorkload(),
        activitiesAPI.getRecent(8),
      ]);

      setProjects(projRes.data.data || []);
      setTasks(taskRes.data.data || []);
      setWorkloads(workloadRes.data.data || []);
      setActivities(actRes.data.data || []);
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to load dashboard data', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 font-medium">Analyzing system productivity...</span>
        </div>
      </div>
    );
  }

  // Compute metrics
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
  
  const today = new Date();
  const overdueTasks = tasks.filter(t => {
    return t.status !== 'Completed' && new Date(t.dueDate) < today;
  }).length;

  // Tasks by Priority
  const highPriorityCount = tasks.filter(t => t.priority === 'High').length;
  const mediumPriorityCount = tasks.filter(t => t.priority === 'Medium').length;
  const lowPriorityCount = tasks.filter(t => t.priority === 'Low').length;

  // Task Status distribution
  const todoCount = tasks.filter(t => t.status === 'Todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;

  // Project progress calculations
  const projectSummaries = projects.map(proj => {
    const projTasks = tasks.filter(t => t.project?._id === proj._id);
    const totalProjTasks = projTasks.length;
    const completedProjTasks = projTasks.filter(t => t.status === 'Completed').length;
    const pendingProjTasks = totalProjTasks - completedProjTasks;
    const completionPercent = totalProjTasks > 0 ? Math.round((completedProjTasks / totalProjTasks) * 100) : 0;
    
    // Calculate relative urgency text
    const daysLeft = Math.ceil((new Date(proj.deadline) - today) / (1000 * 60 * 60 * 24));
    let deadlineText = '';
    if (daysLeft < 0) {
      deadlineText = `Overdue by ${Math.abs(daysLeft)} days`;
    } else if (daysLeft === 0) {
      deadlineText = 'Deadline today';
    } else if (daysLeft === 1) {
      deadlineText = 'Deadline tomorrow';
    } else {
      deadlineText = `Deadline in ${daysLeft} days`;
    }

    return {
      ...proj,
      pendingCount: pendingProjTasks,
      completionPercent,
      deadlineText,
      totalCount: totalProjTasks
    };
  });

  // KPI card configuration
  const kpis = [
    { title: 'Total Projects', value: totalProjects, icon: <Folder className="w-5 h-5" />, color: 'from-blue-600/20 to-indigo-600/5 border-blue-500/20 text-blue-400' },
    { title: 'Total Tasks', value: totalTasks, icon: <ListTodo className="w-5 h-5" />, color: 'from-indigo-600/20 to-violet-600/5 border-indigo-500/20 text-indigo-400' },
    { title: 'Completed Tasks', value: completedTasks, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-emerald-600/20 to-teal-600/5 border-emerald-500/20 text-emerald-400' },
    { title: 'Pending Tasks', value: pendingTasks, icon: <Clock className="w-5 h-5" />, color: 'from-amber-600/20 to-orange-600/5 border-amber-500/20 text-amber-400' },
    { title: 'Overdue Tasks', value: overdueTasks, icon: <AlertCircle className="w-5 h-5" />, color: 'from-rose-600/20 to-red-600/5 border-rose-500/20 text-rose-400 animate-pulse' },
  ];

  return (
    <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Title greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Dashboard Insights
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time analytics and workload tracking metrics across the collaboration platform.
          </p>
        </div>
        <button
          onClick={() => onViewChange('tasks')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer self-start md:self-auto"
        >
          View Kanban Board
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            className={`glass-panel border p-4 rounded-xl flex items-center justify-between bg-gradient-to-br ${kpi.color}`}
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 tracking-wider block">{kpi.title}</span>
              <span className="text-2xl font-bold text-white block">{kpi.value}</span>
            </div>
            <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800">
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tasks by Priority (Bar chart) */}
        <div className="lg:col-span-4 glass-panel border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-200">Tasks by Priority</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of tasks sorted by urgency.</p>
          </div>
          <div className="space-y-4 my-6">
            {/* High Priority */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-rose-400 font-semibold">High Priority</span>
                <span className="text-slate-400">{highPriorityCount} tasks</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-500" 
                  style={{ width: `${totalTasks > 0 ? (highPriorityCount / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            {/* Medium Priority */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-indigo-400 font-semibold">Medium Priority</span>
                <span className="text-slate-400">{mediumPriorityCount} tasks</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" 
                  style={{ width: `${totalTasks > 0 ? (mediumPriorityCount / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            {/* Low Priority */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Low Priority</span>
                <span className="text-slate-400">{lowPriorityCount} tasks</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-slate-500 to-slate-400 transition-all duration-500" 
                  style={{ width: `${totalTasks > 0 ? (lowPriorityCount / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-900 pt-3 flex justify-between">
            <span>High priority tasks require immediate review.</span>
          </div>
        </div>

        {/* Task Status Distribution (Donut Chart representation) */}
        <div className="lg:col-span-4 glass-panel border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-200">Task Status Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Task lifecycle breakdown.</p>
          </div>
          
          {/* Custom SVG Donut representation */}
          <div className="relative flex items-center justify-center py-6">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="rgba(15, 23, 42, 0.6)"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="#10b981" // Completed
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - (totalTasks > 0 ? completedTasks / totalTasks : 0))}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-bold text-white block">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </span>
              <span className="text-[10px] font-bold text-emerald-400 tracking-wide uppercase">Completed</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-900 pt-4">
            <div>
              <span className="block text-slate-400 font-semibold">Todo</span>
              <span className="block text-sm font-bold text-slate-300 mt-0.5">{todoCount}</span>
            </div>
            <div>
              <span className="block text-blue-400 font-semibold">In Progress</span>
              <span className="block text-sm font-bold text-blue-300 mt-0.5">{inProgressCount}</span>
            </div>
            <div>
              <span className="block text-emerald-400 font-semibold">Done</span>
              <span className="block text-sm font-bold text-emerald-300 mt-0.5">{completedTasks}</span>
            </div>
          </div>
        </div>

        {/* Project Summaries Widget (Progress Tracking) */}
        <div className="lg:col-span-4 glass-panel border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-200">Project Progress Overview</h3>
            <p className="text-xs text-slate-500 mt-0.5">Summary of major team deliverables.</p>
          </div>

          <div className="my-4 space-y-4 max-h-[180px] overflow-y-auto pr-1">
            {projectSummaries.map((proj, idx) => (
              <div key={proj._id || idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300 truncate max-w-[150px]">{proj.name}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    {proj.completionPercent === 100 ? (
                      <span className="text-emerald-400 font-bold">100% completed</span>
                    ) : proj.status === 'On Hold' ? (
                      <span className="text-amber-500 font-semibold">On Hold</span>
                    ) : (
                      <span className="font-medium text-slate-400">{proj.pendingCount} tasks pending</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        proj.status === 'On Hold' 
                          ? 'bg-amber-500' 
                          : proj.completionPercent === 100 
                            ? 'bg-emerald-500' 
                            : 'bg-indigo-500'
                      }`}
                      style={{ width: `${proj.completionPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 w-24 text-right truncate">
                    {proj.deadlineText}
                  </span>
                </div>
              </div>
            ))}
            {projectSummaries.length === 0 && (
              <span className="text-xs text-slate-500 italic block py-4 text-center">No projects registered.</span>
            )}
          </div>

          <div className="text-xs text-slate-500 border-t border-slate-900 pt-3 flex justify-between items-center">
            <span>Overall completion trends.</span>
            <button 
              onClick={() => onViewChange('projects')}
              className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer hover:underline"
            >
              Manage Projects
            </button>
          </div>
        </div>

      </div>

      {/* Team Workload & Upcoming Deadlines / Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Member Workload Summary */}
        <div className="lg:col-span-6 glass-panel border border-slate-800/80 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-200">Member Workload Summary</h3>
              <p className="text-xs text-slate-500 mt-0.5">Assigned tasks and completed work ratio per member.</p>
            </div>
            <button 
              onClick={() => onViewChange('team')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
            >
              View Team
            </button>
          </div>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
            {workloads.map((item, idx) => {
              const total = item.totalTasks;
              const completed = item.completedTasks;
              const ratio = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={item.member._id || idx} className="flex items-center gap-4 p-2 bg-slate-900/30 rounded-xl border border-slate-900">
                  <img
                    src={item.member.avatarUrl}
                    alt={item.member.name}
                    className="w-9 h-9 rounded-full bg-slate-800 border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300 truncate">{item.member.name}</span>
                      <span className="text-slate-400 font-medium">
                        {completed}/{total} tasks ({ratio}%)
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500" 
                          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 w-24 text-right truncate">
                        {item.pendingTasks} pending tasks
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {workloads.length === 0 && (
              <span className="text-xs text-slate-500 italic block py-4 text-center">No workloads recorded.</span>
            )}
          </div>
        </div>

        {/* Recent Activities list (Logs) */}
        <div className="lg:col-span-6 glass-panel border border-slate-800/80 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-200">Recent Activities</h3>
              <p className="text-xs text-slate-500 mt-0.5">Logs of recent updates on tasks and projects.</p>
            </div>
            <button 
              onClick={() => onViewChange('activities')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
            >
              View Logs
            </button>
          </div>

          <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
            {activities.map((act, idx) => (
              <div key={act._id || idx} className="flex gap-3 text-xs leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0 animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 font-medium">{act.text}</p>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — by {act.user?.name || 'System'}
                  </span>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <span className="text-xs text-slate-500 italic block py-6 text-center">No recent activities.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
