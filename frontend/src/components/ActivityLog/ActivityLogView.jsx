'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { activitiesAPI } from '../../lib/api';
import { showToast } from '../../store/appSlice';
import { Activity, Search, RefreshCw, Clock, Filter } from 'lucide-react';

export default function ActivityLogView() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await activitiesAPI.getRecent(100);
      setActivities(res.data.data || []);
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to fetch activities', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Filter activities
  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.text.toLowerCase().includes(search.toLowerCase()) ||
                          (act.user && act.user.name.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || act.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Title & Operations */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            System Activity Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Audit trail of all tasks, projects, and workload adjustments.</p>
        </div>

        <button
          onClick={fetchActivities}
          disabled={loading}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer border border-slate-800"
          title="Refresh activity log"
        >
          <RefreshCw className={`w-4 h-4 ${loading && 'animate-spin'}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search activities by log description or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-52 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Activities</option>
            <option value="project_created">Project Created</option>
            <option value="project_updated">Project Updated</option>
            <option value="project_deleted">Project Deleted</option>
            <option value="task_created">Task Created</option>
            <option value="task_updated">Task Updated</option>
            <option value="task_deleted">Task Deleted</option>
            <option value="task_assigned">Task Assigned</option>
            <option value="task_completed">Task Completed</option>
            <option value="member_added">Member Added</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 relative">
          
          {/* Vertical timeline line */}
          <div className="absolute left-8.5 top-8 bottom-8 w-0.5 bg-slate-850 pointer-events-none"></div>

          <div className="space-y-6">
            {filteredActivities.map((act, idx) => {
              const iconColors = {
                project_created: 'bg-blue-950 text-blue-400 border-blue-500/20',
                project_updated: 'bg-indigo-950 text-indigo-400 border-indigo-500/20',
                project_deleted: 'bg-rose-950 text-rose-400 border-rose-500/20',
                task_created: 'bg-violet-950 text-violet-400 border-violet-500/20',
                task_updated: 'bg-indigo-950 text-indigo-400 border-indigo-500/20',
                task_deleted: 'bg-rose-950 text-rose-400 border-rose-500/20',
                task_assigned: 'bg-purple-950 text-purple-400 border-purple-500/20',
                task_completed: 'bg-emerald-950 text-emerald-400 border-emerald-500/20',
                member_added: 'bg-teal-950 text-teal-400 border-teal-500/20',
              }[act.type] || 'bg-slate-900 text-slate-400 border-slate-800';

              return (
                <div key={act._id || idx} className="flex gap-4 relative items-start">
                  
                  {/* Timeline icon */}
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold z-10 flex-shrink-0 bg-slate-950 ${iconColors}`}>
                    {act.type.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 bg-slate-900/20 border border-slate-900 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{act.text}</p>
                      
                      {/* Log meta details */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          {new Date(act.createdAt).toLocaleDateString()} at {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span>Action by: {act.user?.name || 'System'} ({act.user?.role || 'Service'})</span>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-600 font-mono select-all truncate">
                      ID: {(act._id || '').slice(-8).toUpperCase()}
                    </span>
                  </div>

                </div>
              );
            })}

            {filteredActivities.length === 0 && (
              <div className="py-8 text-center text-slate-500 italic">No activity logs found.</div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
