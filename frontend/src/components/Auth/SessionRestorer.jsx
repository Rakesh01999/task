'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../../store/authSlice';
import { authAPI } from '../../lib/api';

export default function SessionRestorer({ children }) {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const [sessionChecking, setSessionChecking] = useState(true);

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

    return <>{children}</>;
}