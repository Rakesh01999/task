'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { teamAPI } from '../../lib/api';
import { showToast } from '../../store/appSlice';
import { Users, UserPlus, Mail, ShieldAlert, X, Activity, UserCheck } from 'lucide-react';

export default function TeamView() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  
  const [loading, setLoading] = useState(true);
  const [workloads, setWorkloads] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form States (New Team Member)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Team Member');

  const isAdmin = currentUser && currentUser.role === 'Admin';

  const fetchWorkloads = async () => {
    try {
      setLoading(true);
      const res = await teamAPI.getWorkload();
      setWorkloads(res.data.data || []);
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to fetch team details', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkloads();
  }, []);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      dispatch(showToast({ message: 'All fields are required', type: 'warning' }));
      return;
    }

    try {
      await teamAPI.create({ name, email, password, role });
      dispatch(showToast({ message: `Successfully registered ${name} under role ${role}!`, type: 'success' }));
      setShowAddModal(false);
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('Team Member');
      
      fetchWorkloads();
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to register member', type: 'error' }));
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Title & Operations */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Team Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage access controls, roles, and review member workloads.</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Grid of Team Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workloads.map((item, idx) => {
            const { member, totalTasks, completedTasks, pendingTasks } = item;
            
            const roleStyles = {
              Admin: 'bg-emerald-950/60 border-emerald-500/20 text-emerald-400',
              'Project Manager': 'bg-indigo-950/60 border-indigo-500/20 text-indigo-400',
              'Team Member': 'bg-slate-900 border-slate-800 text-slate-400',
            }[member.role] || 'bg-slate-900 border-slate-800 text-slate-400';

            const completionRatio = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div 
                key={member._id || idx}
                className="glass-panel border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between glass-card-hover"
              >
                <div>
                  {/* Top section: Avatar and Role */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-12 h-12 rounded-full border border-indigo-500/20 bg-slate-850"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-200 truncate">{member.name}</h3>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border whitespace-nowrap ${roleStyles}`}>
                      {member.role}
                    </span>
                  </div>

                  {/* Task Workload figures */}
                  <div className="grid grid-cols-3 gap-2 py-3 bg-slate-950/40 rounded-xl border border-slate-900 text-center text-xs mt-3">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-bold tracking-wide uppercase">Total</span>
                      <span className="block text-sm font-bold text-slate-300 mt-1">{totalTasks}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-bold tracking-wide uppercase">Done</span>
                      <span className="block text-sm font-bold text-emerald-400 mt-1">{completedTasks}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-bold tracking-wide uppercase">Pending</span>
                      <span className="block text-sm font-bold text-amber-500 mt-1">{pendingTasks}</span>
                    </div>
                  </div>

                  {/* Workload Progress meter */}
                  <div className="mt-5 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>Workload Completion Ratio</span>
                      <span className="text-slate-400">{completionRatio}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${completionRatio}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    System Active
                  </span>
                  <span>Member ID: {(member._id || '').slice(-6).toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Team Member Modal (Admin-only) */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                Register Team Member
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400" htmlFor="member-name-input">Full Name *</label>
                <input
                  type="text"
                  id="member-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400" htmlFor="member-email-input">Email Address *</label>
                <input
                  type="email"
                  id="member-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. johndoe@company.com"
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400" htmlFor="member-password-input">Password *</label>
                <input
                  type="password"
                  id="member-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400" htmlFor="member-role-select">Access Control (Role) *</label>
                <select
                  id="member-role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="Team Member">Team Member</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
