import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Library, Target, Upload, Settings, BookOpen, Highlighter } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Library', icon: Library, path: '/library' },
    { name: 'Highlights', icon: Highlighter, path: '/highlights' },
    { name: 'Study', icon: Target, path: '/study' },
    { name: 'Import', icon: Upload, path: '/import' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-zinc-200 text-zinc-900 hidden md:flex flex-col z-10">
      <div className="flex items-center gap-3 h-20 px-8 border-b border-zinc-100">
        <div className="p-1.5 bg-black text-white rounded-md">
           <BookOpen className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight">Kindle Mgr.</span>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
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

      <div className="p-6 border-t border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-xs">
            AD
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Admin User</p>
            <p className="text-xs text-zinc-400">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;