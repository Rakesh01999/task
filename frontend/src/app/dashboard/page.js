'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import Navbar from '../../components/Layout/Navbar';
import DashboardView from '../../components/Dashboard/DashboardView';
import ProjectsView from '../../components/Projects/ProjectsView';
import TasksView from '../../components/Tasks/TasksView';
import TeamView from '../../components/Team/TeamView';
import ActivityLogView from '../../components/ActivityLog/ActivityLogView';

export default function Dashboard() {
    const router = useRouter();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const sidebarOpen = useSelector((state) => state.app.sidebarOpen);

    const [currentView, setCurrentView] = useState('dashboard');

    // Redirect non-authenticated users to home page
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/');
        }
    }, [isAuthenticated, router]);

    // If not authenticated, show nothing while redirecting
    if (!isAuthenticated) {
        return null;
    }

    const handleRefreshData = () => {
        const prevView = currentView;
        setCurrentView('');
        setTimeout(() => setCurrentView(prevView), 10);
    };

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