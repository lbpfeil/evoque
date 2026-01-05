import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/' },
    { name: 'Study', icon: Target, path: '/study' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-center h-20 py-2 md:hidden z-50 safe-area-inset-bottom">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 min-w-[64px] ${
              isActive ? 'text-black dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
            }`
          }
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
