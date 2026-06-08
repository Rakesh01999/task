'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
    Shield,
    FolderKanban,
    ListTodo,
    Users,
    Activity,
    ArrowRight,
    CheckCircle2,
    Zap,
    BarChart3,
    Sparkles,
} from 'lucide-react';

export default function HomePage() {
    const router = useRouter();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    if (isAuthenticated) {
        router.replace('/dashboard');
        return null;
    }

    const features = [
        {
            icon: FolderKanban,
            title: 'Project Management',
            description: 'Create and organize projects with deadlines, status tracking, and team assignment.',
            color: 'from-indigo-500 to-indigo-700',
            glow: 'rgba(99, 102, 241, 0.15)',
        },
        {
            icon: ListTodo,
            title: 'Kanban Task Board',
            description: 'Drag-and-drop task management with priority levels, status columns, and conflict validation.',
            color: 'from-violet-500 to-violet-700',
            glow: 'rgba(139, 92, 246, 0.15)',
        },
        {
            icon: Users,
            title: 'Team Directory',
            description: 'Role-based team management with workload insights and member profiles.',
            color: 'from-purple-500 to-purple-700',
            glow: 'rgba(168, 85, 247, 0.15)',
        },
        {
            icon: Activity,
            title: 'Activity Tracking',
            description: 'Real-time activity logs to monitor every action across projects and tasks.',
            color: 'from-fuchsia-500 to-fuchsia-700',
            glow: 'rgba(217, 70, 239, 0.15)',
        },
        {
            icon: BarChart3,
            title: 'Dashboard Insights',
            description: 'Visual analytics with project stats, task completion rates, and team productivity metrics.',
            color: 'from-pink-500 to-pink-700',
            glow: 'rgba(236, 72, 153, 0.15)',
        },
        {
            icon: Shield,
            title: 'Role-Based Access',
            description: 'Admin, Project Manager, and Team Member roles with permission-controlled actions.',
            color: 'from-emerald-500 to-emerald-700',
            glow: 'rgba(16, 185, 129, 0.15)',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-base text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]">
                            S
                        </div>
                        <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400">
                            TaskCom
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/auth')}
                            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-all cursor-pointer"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => router.push('/auth?mode=register')}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            Get Started
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-1 text-center lg:text-left space-y-6">
                        <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                            <span className="text-white">Manage projects,</span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400">
                                assign tasks,
                            </span>
                            <br />
                            <span className="text-white">track team progress.</span>
                        </h1>

                        <p className="text-slate-400 text-lg max-w-lg mx-auto lg:mx-0">
                            A premium, role-based platform designed to organize workloads, automate conflict validation, and deliver insights into team productivity.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                            <button
                                onClick={() => router.push('/auth')}
                                className="px-6 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all cursor-pointer flex items-center gap-2"
                            >
                                Start Collaborating
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => router.push('/auth?demo=true')}
                                className="px-6 py-3 text-base font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                            >
                                <Zap className="w-4 h-4 text-indigo-400" />
                                Try Demo Account
                            </button>
                        </div>

                        <div className="flex items-center gap-6 pt-6 justify-center lg:justify-start text-sm text-slate-500">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Role-based access
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Conflict validation
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Real-time insights
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-3">Everything your team needs</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Powerful features built for modern teams. From project planning to real-time analytics, TaskCom keeps everyone aligned.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="glass-panel rounded-xl p-6 glass-card-hover group cursor-default"
                            style={{ boxShadow: `0 0 20px ${feature.glow}` }}
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-800/80 py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                            S
                        </div>
                        <span className="font-semibold text-sm bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                            TaskCom
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">
                        © 2026 TaskCom. Built for modern teams.
                    </p>
                </div>
            </footer>
        </div>
    );
}