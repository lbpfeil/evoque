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

      <div className="p-4 border-t border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-[10px]">
            AD
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-900">Admin User</p>
            <p className="text-[10px] text-zinc-400">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;