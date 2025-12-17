import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Library, Target, Upload, Settings, BookOpen, Highlighter, LogOut, ChevronUp } from 'lucide-react';
import { useAuth } from './AuthContext';

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Library', icon: Library, path: '/library' },
    { name: 'Highlights', icon: Highlighter, path: '/highlights' },
    { name: 'Study', icon: Target, path: '/study' },
    { name: 'Import', icon: Upload, path: '/import' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-zinc-200 text-zinc-900 hidden md:flex flex-col z-10">
      <div className="flex items-center gap-3 h-14 px-6 border-b border-zinc-100">
        <div className="p-1.5 bg-black text-white rounded-md">
          <BookOpen className="w-4 h-4" />
        </div>
        <span className="font-bold text-base tracking-tight">Kindle Mgr.</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-zinc-100 text-black'
                : 'text-zinc-500 hover:text-black hover:bg-zinc-50'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Menu */}
      <div className="border-t border-zinc-100">
        {/* Logout Menu (appears above user button) */}
        {showLogout && (
          <div className="p-2 border-b border-zinc-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sair
            </button>
          </div>
        )}

        {/* User Info Button */}
        <button
          onClick={() => setShowLogout(!showLogout)}
          className="w-full p-4 hover:bg-zinc-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {user?.email ? getUserInitials(user.email) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-900 truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-[10px] text-zinc-500">Free Plan</p>
            </div>
            <ChevronUp
              className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showLogout ? '' : 'rotate-180'}`}
            />
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;