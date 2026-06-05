'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { tasksAPI, projectsAPI, teamAPI } from '../../lib/api';
import { showToast, setActiveProjectId } from '../../store/appSlice';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  MoreHorizontal,
  ChevronRight, 
  ChevronLeft,
  X,
  PlusCircle,
  Trash2,
  CheckSquare,
  Sparkles,
  ArrowRightLeft,
  FileText
} from 'lucide-react';

export default function TasksView() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const activeProjectId = useSelector((state) => state.app.activeProjectId);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [deadlineFilter, setDeadlineFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latestCreated');

  // Bulk Actions
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  // Modals
  const [showTaskFormModal, setShowTaskFormModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  
  // Selected task for detail/editing
  const [activeTask, setActiveTask] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form States (Create / Edit Task)
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskProjId, setTaskProjId] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStatus, setTaskStatus] = useState('Todo');

  // Comment & File Upload States
  const [commentText, setCommentText] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isAuthorized = currentUser && ['Admin', 'Project Manager'].includes(currentUser.role);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [projRes, teamRes] = await Promise.all([
        projectsAPI.getAll(),
        teamAPI.getAll()
      ]);
      setProjects(projRes.data.data || []);
      setTeam(teamRes.data.data || []);
      
      // Load tasks
      await refreshTasks();
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to load task resources', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = async () => {
    try {
      const filters = {};
      if (activeProjectId !== 'all') {
        filters.project = activeProjectId;
      }
      if (priorityFilter !== 'all') {
        filters.priority = priorityFilter;
      }
      if (assigneeFilter !== 'all') {
        filters.assignedMember = assigneeFilter;
      }
      if (deadlineFilter !== 'all') {
        filters.deadlineStatus = deadlineFilter;
      }
      if (search !== '') {
        filters.search = search;
      }
      filters.sortBy = sortBy;
      filters.limit = 200; // Load plenty

      const taskRes = await tasksAPI.getAll(filters);
      setTasks(taskRes.data.data || []);
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to refresh tasks list', type: 'error' }));
    }
  };

  useEffect(() => {
    loadAllData();
  }, [activeProjectId, priorityFilter, assigneeFilter, deadlineFilter, sortBy, search]);

  const handleOpenCreateTask = () => {
    if (!isAuthorized) return;
    setIsEditMode(false);
    setTaskTitle('');
    setTaskDesc('');
    setTaskProjId(activeProjectId !== 'all' ? activeProjectId : (projects[0]?._id || ''));
    setTaskAssigneeId('');
    setTaskDueDate('');
    setTaskPriority('Medium');
    setTaskStatus('Todo');
    setShowTaskFormModal(true);
  };

  const handleOpenEditTask = (task) => {
    // Check RBAC permission: Team Member can only edit status / comments
    // Admin & PM can edit anything
    if (currentUser.role === 'Team Member') {
      const isAssigned = task.assignedMember && task.assignedMember._id === currentUser.id;
      if (!isAssigned) {
        dispatch(showToast({ message: 'Team Members can only edit tasks assigned to them.', type: 'warning' }));
        return;
      }
    }

    setIsEditMode(true);
    setActiveTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskProjId(task.project?._id || '');
    setTaskAssigneeId(task.assignedMember?._id || '');
    setTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setShowTaskFormModal(true);
  };

  const handleOpenTaskDetail = async (task) => {
    try {
      const res = await tasksAPI.getById(task._id);
      setActiveTask(res.data.data);
      setShowTaskDetailModal(true);
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to load task details', type: 'error' }));
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskProjId || !taskDueDate) {
      dispatch(showToast({ message: 'Title, Project, and Due Date are required', type: 'warning' }));
      return;
    }

    // Client-side rule check: Past due dates (if creating or if date changed)
    const todayStr = new Date().toISOString().split('T')[0];
    if (taskDueDate < todayStr) {
      dispatch(showToast({ message: 'Please select a valid deadline.', type: 'error' }));
      return;
    }

    try {
      const taskData = {
        title: taskTitle,
        description: taskDesc,
        project: taskProjId,
        assignedMember: taskAssigneeId || null,
        dueDate: taskDueDate,
        priority: taskPriority,
        status: taskStatus
      };

      if (isEditMode) {
        // Backend validation errors will bubble up here
        await tasksAPI.update(activeTask._id, taskData);
        dispatch(showToast({ message: 'Task updated successfully', type: 'success' }));
      } else {
        await tasksAPI.create(taskData);
        dispatch(showToast({ message: 'Task created successfully', type: 'success' }));
      }
      
      setShowTaskFormModal(false);
      refreshTasks();
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to save task', type: 'error' }));
    }
  };

  const handleQuickStatusChange = async (task, newStatus) => {
    // RBAC: check if team member is assigned to task
    if (currentUser.role === 'Team Member') {
      const isAssigned = task.assignedMember && task.assignedMember._id === currentUser.id;
      if (!isAssigned) {
        dispatch(showToast({ message: 'Team Members can only update the status of tasks assigned to them.', type: 'warning' }));
        return;
      }
    }

    try {
      await tasksAPI.update(task._id, { status: newStatus });
      dispatch(showToast({ message: `Task moved to ${newStatus}`, type: 'success' }));
      refreshTasks();
      if (showTaskDetailModal && activeTask?._id === task._id) {
        // refresh detail modal
        const res = await tasksAPI.getById(task._id);
        setActiveTask(res.data.data);
      }
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to update task status', type: 'error' }));
    }
  };

  const handleDeleteTask = async (id) => {
    if (!isAuthorized) return;
    if (confirm('Delete this task permanently?')) {
      try {
        await tasksAPI.delete(id);
        dispatch(showToast({ message: 'Task deleted successfully', type: 'success' }));
        setShowTaskDetailModal(false);
        refreshTasks();
      } catch (error) {
        dispatch(showToast({ message: error.message || 'Failed to delete task', type: 'error' }));
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await tasksAPI.addComment(activeTask._id, commentText);
      dispatch(showToast({ message: 'Comment posted', type: 'success' }));
      setCommentText('');
      
      // Refresh active task comments
      const updatedTaskRes = await tasksAPI.getById(activeTask._id);
      setActiveTask(updatedTaskRes.data.data);
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to post comment', type: 'error' }));
    }
  };

  const handleUploadAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingFile(true);
      setUploadProgress(20);
      
      // Simulate progression interval
      const progTimer = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 15 : prev));
      }, 100);

      await tasksAPI.uploadAttachment(activeTask._id, formData);
      
      clearInterval(progTimer);
      setUploadProgress(100);
      dispatch(showToast({ message: `File "${file.name}" uploaded successfully!`, type: 'success' }));
      
      // Refresh task details
      const updatedTaskRes = await tasksAPI.getById(activeTask._id);
      setActiveTask(updatedTaskRes.data.data);
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to upload attachment', type: 'error' }));
    } finally {
      setTimeout(() => {
        setUploadingFile(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Bulk status update
  const handleBulkStatusUpdate = async () => {
    if (selectedTaskIds.length === 0 || !bulkStatus) return;
    
    try {
      setLoading(true);
      let successCount = 0;
      let failCount = 0;
      let errorMsg = '';

      for (let taskId of selectedTaskIds) {
        try {
          const task = tasks.find(t => t._id === taskId);
          // Check RBAC permission for each task
          if (currentUser.role === 'Team Member') {
            const isAssigned = task && task.assignedMember && task.assignedMember._id === currentUser.id;
            if (!isAssigned) {
              failCount++;
              continue;
            }
          }
          await tasksAPI.update(taskId, { status: bulkStatus });
          successCount++;
        } catch (err) {
          failCount++;
          errorMsg = err.message;
        }
      }

      if (successCount > 0) {
        dispatch(showToast({ message: `Bulk updated status of ${successCount} tasks to ${bulkStatus}`, type: 'success' }));
      }
      if (failCount > 0) {
        dispatch(showToast({ 
          message: `Failed to update ${failCount} tasks. ${currentUser.role === 'Team Member' ? 'Only assigned tasks can be updated.' : errorMsg}`, 
          type: 'warning' 
        }));
      }

      setSelectedTaskIds([]);
      setBulkStatus('');
      refreshTasks();
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Bulk update failed', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!isAuthorized || selectedTaskIds.length === 0) return;
    if (confirm(`Are you sure you want to delete all ${selectedTaskIds.length} selected tasks?`)) {
      try {
        setLoading(true);
        for (let taskId of selectedTaskIds) {
          await tasksAPI.delete(taskId);
        }
        dispatch(showToast({ message: `Deleted ${selectedTaskIds.length} tasks successfully`, type: 'success' }));
        setSelectedTaskIds([]);
        refreshTasks();
      } catch (error) {
        dispatch(showToast({ message: error.message || 'Bulk delete failed', type: 'error' }));
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSelectTask = (id) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter(tid => tid !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  // Split tasks into Kanban columns
  const columns = {
    Todo: tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    Completed: tasks.filter(t => t.status === 'Completed')
  };

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Title & Operations */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            Kanban Task Board
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Organize team deliverables and map progress workflows.</p>
        </div>

        {isAuthorized && (
          <button
            onClick={handleOpenCreateTask}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>

      {/* Project Selector Tab Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => dispatch(setActiveProjectId('all'))}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
            activeProjectId === 'all'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Projects
        </button>
        {projects.map((proj) => (
          <button
            key={proj._id}
            onClick={() => dispatch(setActiveProjectId(proj._id))}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              activeProjectId === proj._id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {proj.name}
          </button>
        ))}
      </div>

      {/* Kanban Filters & Sort Toolbar */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Search */}
        <div className="relative md:col-span-3 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Priority Filter */}
        <div className="md:col-span-2 w-full">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div className="md:col-span-2 w-full">
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {team.map(m => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Deadline filter */}
        <div className="md:col-span-2 w-full">
          <select
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Timeline</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Sorting option */}
        <div className="md:col-span-3 w-full">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="latestCreated">Sort: Latest Created</option>
            <option value="nearestDeadline">Sort: Nearest Deadline</option>
            <option value="highestPriority">Sort: Highest Priority</option>
            <option value="recentlyUpdated">Sort: Recently Updated</option>
          </select>
        </div>

      </div>

      {/* Bulk Actions Panel */}
      {selectedTaskIds.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-indigo-500/20 p-4 rounded-xl gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">
              {selectedTaskIds.length} tasks selected
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
            >
              <option value="">Choose Status...</option>
              <option value="Todo">Move to Todo</option>
              <option value="In Progress">Move to In Progress</option>
              <option value="Completed">Move to Completed</option>
            </select>
            
            <button
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Apply Status
            </button>
            
            {isAuthorized && (
              <button
                onClick={handleBulkDelete}
                className="p-2 bg-rose-950/40 border border-rose-500/30 hover:border-rose-500 text-rose-400 rounded-lg hover:bg-rose-950/60 transition-all cursor-pointer"
                title="Bulk Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => setSelectedTaskIds([])}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(columns).map(([colName, colTasks]) => {
          const titleColors = {
            Todo: 'text-slate-400 bg-slate-900 border-slate-800',
            'In Progress': 'text-blue-400 bg-blue-950/40 border-blue-500/20',
            Completed: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20',
          }[colName];

          return (
            <div key={colName} className="flex flex-col min-h-[450px]">
              {/* Column Header */}
              <div className={`p-3 rounded-xl border flex items-center justify-between font-bold text-sm mb-4 ${titleColors}`}>
                <span>{colName}</span>
                <span className="bg-slate-950/50 px-2 py-0.5 rounded-md text-xs">{colTasks.length}</span>
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 space-y-4 bg-slate-950/20 p-2 rounded-2xl border border-slate-900 border-dashed min-h-[400px]">
                {colTasks.map((task) => {
                  const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysLeft < 0 && task.status !== 'Completed';

                  const priorityStyles = {
                    High: 'bg-rose-950/40 text-rose-400 border-rose-500/10',
                    Medium: 'bg-indigo-950/40 text-indigo-400 border-indigo-500/10',
                    Low: 'bg-slate-900 text-slate-400 border-slate-800',
                  }[task.priority];

                  const isChecked = selectedTaskIds.includes(task._id);

                  return (
                    <div 
                      key={task._id}
                      className={`glass-panel border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:translate-x-1 border-slate-800/80 hover:border-slate-700 ${
                        isChecked && 'border-indigo-500/60 bg-indigo-950/10 shadow-[0_0_15px_rgba(99,102,241,0.08)]'
                      }`}
                      onClick={() => handleOpenTaskDetail(task)}
                    >
                      {/* Top section: Checkbox, Project and Priority */}
                      <div className="flex justify-between items-start gap-2 mb-2" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectTask(task._id)}
                            className="w-4 h-4 accent-indigo-600 rounded bg-slate-900 border-slate-800 cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[120px]">
                            {task.project?.name || 'No Project'}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${priorityStyles}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Task title and description */}
                      <h4 className="font-bold text-sm text-slate-200 line-clamp-1">{task.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                        {task.description || 'No description provided.'}
                      </p>

                      {/* Quick Move Buttons & Assignee */}
                      <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center" onClick={e => e.stopPropagation()}>
                        {/* Due Date Indicator */}
                        <div className={`flex items-center gap-1 text-[10px] font-medium ${
                          isOverdue ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-500'
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {isOverdue 
                              ? `Overdue by ${Math.abs(daysLeft)}d` 
                              : daysLeft === 0 
                                ? 'Due Today' 
                                : daysLeft === 1 
                                  ? 'Due Tomorrow' 
                                  : `Due in ${daysLeft}d`}
                          </span>
                        </div>

                        {/* Status Shift Buttons */}
                        <div className="flex items-center gap-2">
                          {colName !== 'Todo' && (
                            <button
                              onClick={() => handleQuickStatusChange(task, colName === 'Completed' ? 'In Progress' : 'Todo')}
                              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors"
                              title="Move Left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          {/* Assignee Avatar */}
                          {task.assignedMember ? (
                            <img
                              src={task.assignedMember.avatarUrl}
                              alt={task.assignedMember.name}
                              className="w-5.5 h-5.5 rounded-full bg-slate-800 border border-slate-900"
                              title={`Assigned to ${task.assignedMember.name}`}
                            />
                          ) : (
                            <span 
                              className="w-5.5 h-5.5 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-[8px] text-slate-500"
                              title="Unassigned Task"
                            >
                              U
                            </span>
                          )}

                          {colName !== 'Completed' && (
                            <button
                              onClick={() => handleQuickStatusChange(task, colName === 'Todo' ? 'In Progress' : 'Completed')}
                              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors"
                              title="Move Right"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="py-8 text-center text-slate-600 text-xs italic">No tasks in this stage.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation / Editing Form Modal */}
      {showTaskFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-500" />
                {isEditMode ? 'Modify Task Details' : 'Create New Task'}
              </h3>
              <button 
                onClick={() => setShowTaskFormModal(false)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400" htmlFor="task-title-input">Task Title *</label>
                <input
                  type="text"
                  id="task-title-input"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Integrate REST Endpoints"
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400" htmlFor="task-desc-input">Task Description</label>
                <textarea
                  id="task-desc-input"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Provide checklist, details, and requirements..."
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400" htmlFor="task-project-select">Project *</label>
                  <select
                    id="task-project-select"
                    value={taskProjId}
                    onChange={(e) => setTaskProjId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="" disabled>Choose Project...</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400" htmlFor="task-assignee-select">Assigned Member</label>
                  <select
                    id="task-assignee-select"
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {team.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400" htmlFor="task-due-date-input">Due Date *</label>
                  <input
                    type="date"
                    id="task-due-date-input"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400" htmlFor="task-priority-select">Priority</label>
                  <select
                    id="task-priority-select"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400" htmlFor="task-status-select">Status</label>
                  <select
                    id="task-status-select"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskFormModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  {isEditMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details, Comments, and File Attachments Modal */}
      {showTaskDetailModal && activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-slate-800 bg-slate-950/40">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {activeTask.project?.name || 'Project'}
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">{activeTask.title}</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowTaskDetailModal(false);
                    handleOpenEditTask(activeTask);
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Edit
                </button>
                {isAuthorized && (
                  <button
                    onClick={() => handleDeleteTask(activeTask._id)}
                    className="p-1.5 bg-rose-950/20 border border-rose-500/20 hover:border-rose-500 text-rose-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => setShowTaskDetailModal(false)}
                  className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Info & Description */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</h4>
                  <p className="text-sm text-slate-300 mt-2 whitespace-pre-line leading-relaxed bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
                    {activeTask.description || 'No description provided.'}
                  </p>
                </div>

                {/* File Attachments Support */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">File Attachments</h4>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {activeTask.attachments?.map((file, i) => (
                      <div key={file._id || i} className="flex items-center justify-between p-2.5 bg-slate-950/30 border border-slate-850 rounded-xl">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          <span className="text-xs text-slate-300 truncate max-w-[200px]" title={file.filename}>
                            {file.filename}
                          </span>
                        </div>
                        <a
                          href={`http://localhost:5000${file.filepath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                    {(!activeTask.attachments || activeTask.attachments.length === 0) && (
                      <span className="text-xs text-slate-500 italic block py-1">No files attached yet.</span>
                    )}
                  </div>

                  {/* Upload button wrapper */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer">
                      <Paperclip className="w-3.5 h-3.5" />
                      Attach File
                      <input 
                        type="file" 
                        onChange={handleUploadAttachment} 
                        className="hidden" 
                        disabled={uploadingFile} 
                      />
                    </label>
                    {uploadingFile && (
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comment Threads */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comments Thread</h4>
                  
                  {/* List of comments */}
                  <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
                    {activeTask.comments?.map((c, i) => (
                      <div key={c._id || i} className="flex gap-3 text-xs bg-slate-950/20 border border-slate-900 p-3 rounded-xl">
                        <img
                          src={c.user?.avatarUrl}
                          alt=""
                          className="w-7 h-7 rounded-full bg-slate-800 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-300">{c.user?.name}</span>
                            <span className="text-[9px] text-slate-500">
                              {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-400 mt-1">{c.text}</p>
                        </div>
                      </div>
                    ))}
                    {(!activeTask.comments || activeTask.comments.length === 0) && (
                      <span className="text-xs text-slate-500 italic block py-4 text-center">No comments posted yet.</span>
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Post
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Status & Assignment Panel */}
              <div className="md:col-span-5 space-y-6 bg-slate-950/20 border border-slate-900/50 p-5 rounded-2xl max-h-fit">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                  Task Parameters
                </h4>

                <div className="space-y-4">
                  {/* Status selection */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status Workflow</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Todo', 'In Progress', 'Completed'].map(st => {
                        const isCurrent = activeTask.status === st;
                        const colors = {
                          Todo: 'border-slate-800 hover:border-slate-400 hover:text-slate-200',
                          'In Progress': 'border-blue-900/40 text-blue-500 hover:border-blue-500 hover:text-blue-400',
                          Completed: 'border-emerald-900/40 text-emerald-500 hover:border-emerald-500 hover:text-emerald-400',
                        }[st];
                        const activeBg = {
                          Todo: 'bg-slate-800 text-slate-200 border-slate-600',
                          'In Progress': 'bg-blue-950/50 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
                          Completed: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
                        }[st];

                        return (
                          <button
                            key={st}
                            onClick={() => handleQuickStatusChange(activeTask, st)}
                            className={`px-2 py-1.5 border rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                              isCurrent ? activeBg : `text-slate-400 ${colors}`
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Due date status */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Due Deadline</span>
                    <span className="block text-xs font-semibold text-slate-200">
                      {new Date(activeTask.dueDate).toLocaleDateString(undefined, { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>

                  {/* Priority Badge */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Task Priority</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      {
                        High: 'bg-rose-950 text-rose-400 border-rose-500/20',
                        Medium: 'bg-indigo-950 text-indigo-400 border-indigo-500/20',
                        Low: 'bg-slate-900 text-slate-400 border-slate-800',
                      }[activeTask.priority]
                    }`}>
                      {activeTask.priority}
                    </span>
                  </div>

                  {/* Assignee Card */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Assignee</span>
                    {activeTask.assignedMember ? (
                      <div className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                        <img 
                          src={activeTask.assignedMember.avatarUrl} 
                          alt="" 
                          className="w-9 h-9 rounded-full bg-slate-800 border border-slate-800" 
                        />
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-slate-200 truncate">{activeTask.assignedMember.name}</span>
                          <span className="block text-[9px] text-slate-500 mt-0.5 truncate">{activeTask.assignedMember.email}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic block">No member assigned to this task.</span>
                    )}
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
