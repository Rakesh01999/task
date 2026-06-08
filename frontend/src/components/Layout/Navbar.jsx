'use client';

import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery, toggleSidebar } from '../../store/appSlice';
import { Menu, Search, Bell } from 'lucide-react';

export default function Navbar({ title }) {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.app.searchQuery);
  const user = useSelector((state) => state.auth.user);

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
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

      {/* Right section: Notifications */}
      <div className="flex items-center gap-2">
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
