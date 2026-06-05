'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideToast } from '../../store/appSlice';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.app.toast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  if (!toast) return null;

  const { message, type } = toast;

  const styles = {
    success: {
      bg: 'bg-slate-900/90 border-emerald-500/30 text-emerald-400',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
      glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]',
    },
    error: {
      bg: 'bg-slate-900/90 border-rose-500/30 text-rose-400',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
      glow: 'shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]',
    },
    warning: {
      bg: 'bg-slate-900/90 border-amber-500/30 text-amber-400',
      icon: <Info className="w-5 h-5 text-amber-400 flex-shrink-0" />,
      glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]',
    },
  }[type || 'success'];

  return (
    <div 
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md animate-slide-in ${styles.bg} ${styles.glow}`}
      role="alert"
    >
      {styles.icon}
      <span className="text-sm font-medium pr-2 max-w-[280px]">{message}</span>
      <button
        onClick={() => dispatch(hideToast())}
        className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 hover:bg-slate-800 rounded-md cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
