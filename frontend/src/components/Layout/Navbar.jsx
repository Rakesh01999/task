'use client';

import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery, showToast, toggleSidebar } from '../../store/appSlice';
import { Menu, Search, Database, Bell, RefreshCw } from 'lucide-react';
import { authAPI } from '../../lib/api';
import { useState } from 'react';

export default function Navbar({ title, onRefresh }) {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.app.searchQuery);
  const user = useSelector((state) => state.auth.user);
  const [seeding, setSeeding] = useState(false);

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true);
      const res = await authAPI.seed();
      dispatch(showToast({ message: res.data.message || 'Database seeded successfully!', type: 'success' }));
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Seeding failed', type: 'error' }));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="h-16 glass-panel border-b border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-20">
      {/* Left section: mobile sidebar trigger & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-md hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors lg:hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg text-slate-200 hidden md:block">
          {title}
        </h1>
      </div>

      {/* Middle section: Search bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
            id="global-search-input"
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right section: Seed DB & Notifications */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSeedDatabase}
          disabled={seeding}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-indigo-500/20 hover:border-indigo-500/50 text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-950/20 transition-all disabled:opacity-50 cursor-pointer"
          title="Reset database to default demo data"
        >
          {seeding ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Database className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Seed Demo Data</span>
        </button>

        <div className="relative p-1.5 rounded-md hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </div>

        {user && (
          <div className="flex items-center gap-2 ml-1 sm:hidden">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-indigo-500/20"
            />
          </div>
        )}
      </div>
    </header>
  );
}
