'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../store/authSlice';
import { authAPI } from '../lib/api';
import AuthPage from '../components/Auth/AuthPage';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import DashboardView from '../components/Dashboard/DashboardView';
import ProjectsView from '../components/Projects/ProjectsView';
import TasksView from '../components/Tasks/TasksView';
import TeamView from '../components/Team/TeamView';
import ActivityLogView from '../components/ActivityLog/ActivityLogView';

export default function Home() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const sidebarOpen = useSelector((state) => state.app.sidebarOpen);

  const [currentView, setCurrentView] = useState('dashboard');
  const [sessionChecking, setSessionChecking] = useState(true);

  // Check active user session on startup
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('collab_token');
      if (!token) {
        setSessionChecking(false);
        return;
      }

      try {
        const res = await authAPI.me();
        dispatch(loginSuccess({ user: res.data.user, token }));
      } catch (error) {
        console.error('Session restore failed:', error.message);
        dispatch(logout());
      } finally {
        setSessionChecking(false);
      }
    };

    checkSession();
  }, [dispatch]);

  const handleRefreshData = () => {
    // Force views to update by reloading state, which they will do when they see a trigger.
    // In our case, simply reloading the window or triggering subcomponent state is fine.
    // For a cleaner UX, we trigger a soft reload of the view:
    const prevView = currentView;
    setCurrentView('');
    setTimeout(() => setCurrentView(prevView), 10);
  };

  if (sessionChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 font-medium">Restoring secure session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Map view IDs to components
  const viewComponents = {
    dashboard: <DashboardView onViewChange={setCurrentView} />,
    projects: <ProjectsView />,
    tasks: <TasksView />,
    team: <TeamView />,
    activities: <ActivityLogView />,
  };

  const viewTitles = {
    dashboard: 'Dashboard Insights',
    projects: 'Project Board',
    tasks: 'Kanban Task Board',
    team: 'Team Directory',
    activities: 'System Activity Log',
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Dynamic ambient glowing light */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar - fixed on mobile, static on desktop */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden transition-all duration-300">
        
        {/* Top Navbar */}
        <Navbar title={viewTitles[currentView]} onRefresh={handleRefreshData} />

        {/* Dynamic Viewport */}
        <main className="flex-1 flex flex-col min-h-0 bg-slate-950/40 pb-12">
          {viewComponents[currentView] || (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-slate-500 text-sm">Select a section from the sidebar.</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
