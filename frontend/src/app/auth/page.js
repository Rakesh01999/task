'use client';

import { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthPage from '../../components/Auth/AuthPage';

function AuthContent() {
    const router = useRouter();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    // If authenticated, show nothing while redirecting
    if (isAuthenticated) {
        return null;
    }

    return <AuthPage />;
}

export default function Auth() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-slate-400 font-medium">Loading...</span>
                    </div>
                </div>
            }
        >
            <AuthContent />
        </Suspense>
    );
}