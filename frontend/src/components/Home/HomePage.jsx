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
                            SmartCollab
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
                    {/* Left: Text */}
                    <div className="flex-1 text-center lg:text-left space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-xs font-medium text-indigo-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            Smart Project & Task Collaboration
                        </div>

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

                        {/* Trust indicators */}
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

                    {/* Right: Visual preview card */}
                    <div className="flex-1 max-w-lg w-full">
                        <div className="glass-panel rounded-2xl p-6 space-y-4 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm text-slate-300">Dashboard Preview</h3>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-md">Live</span>
                            </div>

                            {/* Mini stat cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/60">
                                    <FolderKanban className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                                    <div className="text-lg font-bold text-white">12</div>
                                    <div className="text-xs text-slate-500">Projects</div>
                                </div>
                                <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/60">
                                    <ListTodo className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                                    <div className="text-lg font-bold text-white">48</div>
                                    <div className="text-xs text-slate-500">Tasks</div>
                                </div>
                                <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/60">
                                    <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                                    <div className="text-lg font-bold text-white">8</div>
                                    <div className="text-xs text-slate-500">Members</div>
                                </div>
                            </div>

                            {/* Mini progress bars */}
                            <div className="space-y-2.5">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Website Redesign</span>
                                        <span className="text-indigo-400">75%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Mobile App</span>
                                        <span className="text-violet-400">45%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">API Integration</span>
                                        <span className="text-emerald-400">90%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '90%' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Mini activity */}
                            <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                                <span>3 tasks completed today</span>
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
                        Powerful features built for modern teams. From project planning to real-time analytics, SmartCollab keeps everyone aligned.
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

            {/* CTA Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                <div className="glass-panel rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-violet-600/10 pointer-events-none"></div>
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            Ready to streamline your workflow?
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Join your team on SmartCollab. Sign in with your credentials or try a demo account to explore all features instantly.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                            <button
                                onClick={() => router.push('/auth')}
                                className="px-8 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all cursor-pointer flex items-center gap-2"
                            >
                                Sign In to Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => router.push('/auth?demo=true')}
                                className="px-8 py-3 text-base font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                            >
                                <Zap className="w-4 h-4 text-indigo-400" />
                                Explore Demo
                            </button>
                        </div>
                    </div>
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
                            SmartCollab
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">
                        © 2026 SmartCollab. Built for modern teams.
                    </p>
                </div>
            </footer>
        </div>
    );
}