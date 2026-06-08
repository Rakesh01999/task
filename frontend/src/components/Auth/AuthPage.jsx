'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import { showToast } from '../../store/appSlice';
import { authAPI } from '../../lib/api';
import { Shield, Mail, Lock, User, UserPlus, ArrowRight, Home } from 'lucide-react';

export default function AuthPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loading = useSelector((state) => state.auth.loading);

  const [isLogin, setIsLogin] = useState(true);

  // Handle URL query params: ?mode=register or ?demo=true
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Team Member');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      dispatch(showToast({ message: 'Please fill in all fields', type: 'warning' }));
      return;
    }

    try {
      dispatch(loginStart());
      let res;
      if (isLogin) {
        res = await authAPI.login(email, password);
        dispatch(showToast({ message: `Welcome back, ${res.data.user.name}!`, type: 'success' }));
      } else {
        res = await authAPI.register(name, email, password, role);
        dispatch(showToast({ message: 'Registration successful! Welcome.', type: 'success' }));
      }
      dispatch(loginSuccess(res.data));
    } catch (error) {
      dispatch(loginFailure(error.message));
      dispatch(showToast({ message: error.message || 'Authentication failed', type: 'error' }));
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    try {
      dispatch(loginStart());
      const res = await authAPI.login(demoEmail, 'password123');
      dispatch(loginSuccess(res.data));
      dispatch(showToast({ message: `Logged in as ${res.data.user.role}!`, type: 'success' }));
    } catch (error) {
      dispatch(loginFailure(error.message));
      dispatch(showToast({
        message: 'Quick login failed. Please check your credentials and try again.',
        type: 'error'
      }));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black p-4 relative overflow-hidden">
      {/* Back to Home link */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer z-20"
      >
        <Home className="w-4 h-4" />
        Back to Home
      </button>

      {/* Dynamic background ambient glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">

        {/* Left column: Brand introduction */}
        <div className="lg:col-span-6 flex flex-col justify-center text-left space-y-6 px-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]">
              S
            </div>
            <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400">
              SmartCollab
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Manage projects, assign tasks, and track team progress.
            </h2>
            <p className="text-slate-400 text-base max-w-md">
              A premium, role-based platform designed to organize workloads, automate conflict validation, and deliver insights into team productivity.
            </p>
          </div>

          {/* Quick Login Section */}
          <div className="pt-4 space-y-3">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              Demo Login Credentials
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickLogin('admin@system.com')}
                disabled={loading}
                className="flex flex-col items-start p-3 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900 rounded-xl transition-all text-left cursor-pointer group"
              >
                <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">Admin Account</span>
                <span className="text-[10px] text-slate-500 mt-1 truncate w-full">admin@system.com</span>
                <span className="text-[9px] text-slate-600 mt-0.5 font-mono">pass: password123</span>
              </button>

              <button
                onClick={() => handleQuickLogin('pm@system.com')}
                disabled={loading}
                className="flex flex-col items-start p-3 bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900 rounded-xl transition-all text-left cursor-pointer group"
              >
                <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300">Project Manager</span>
                <span className="text-[10px] text-slate-500 mt-1 truncate w-full">pm@system.com</span>
                <span className="text-[9px] text-slate-600 mt-0.5 font-mono">pass: password123</span>
              </button>

              <button
                onClick={() => handleQuickLogin('member@system.com')}
                disabled={loading}
                className="flex flex-col items-start p-3 bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 hover:bg-slate-900 rounded-xl transition-all text-left cursor-pointer group"
              >
                <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300">Team Member</span>
                <span className="text-[10px] text-slate-500 mt-1 truncate w-full">member@system.com</span>
                <span className="text-[9px] text-slate-600 mt-0.5 font-mono">pass: password123</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Login/Register Box */}
        <div className="lg:col-span-6 flex items-center justify-center px-4">
          <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl border-slate-800/80 animate-fade-in-up">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">
                {isLogin
                  ? 'Access your workspace and view team activity.'
                  : 'Register a new developer account under the system.'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400" htmlFor="name-input">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      id="name-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sarah Connor"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400" htmlFor="email-input">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    id="email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400" htmlFor="password-input">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    id="password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400" htmlFor="role-select">Access Level (Role)</label>
                  <select
                    id="role-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Team Member">Team Member</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-900 flex justify-center text-xs">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  dispatch(loginFailure(null));
                }}
                className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
