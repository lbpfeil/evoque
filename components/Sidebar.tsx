import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, Settings, BookOpen, Highlighter, LogOut, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';
import { useSidebarContext } from './SidebarContext';
import { ThemeToggle } from './ThemeToggle';

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const { settings } = useStore();
  const { isExpanded, toggleCollapsed, handleMouseEnter, handleMouseLeave } = useSidebarContext();
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
    { name: 'Highlights', icon: Highlighter, path: '/highlights' },
    { name: 'Study', icon: Target, path: '/study' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 ${isExpanded ? 'w-56' : 'w-14'} bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hidden md:flex flex-col z-10 transition-[width] duration-300 ease-in-out overflow-hidden`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center h-14 border-b border-zinc-100 dark:border-zinc-800 relative">
        {/* Logo - SEMPRE na mesma posição (ml-3 fixo) */}
        <div className="p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-md ml-3 shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>

        {/* Texto - fade com opacity, w-0 quando invisível */}
        <span
          className={`font-bold text-base tracking-tight ml-2 whitespace-nowrap transition-opacity duration-200 ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0 w-0 overflow-hidden pointer-events-none'}`}
        >
          Kindle Mgr.
        </span>

        {/* Spacer para empurrar toggle button para direita */}
        <div className="flex-1" />

        {/* Toggle Button - fade quando collapsed */}
        <button
          onClick={toggleCollapsed}
          className={`p-1.5 mr-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-opacity duration-200 shrink-0 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-label={isExpanded ? "Recolher sidebar" : "Expandir sidebar"}
          title={isExpanded ? "Recolher sidebar" : "Expandir sidebar"}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center pl-2 pr-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
                ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`
            }
          >
            {/* Ícone - SEMPRE na mesma posição, centralizado quando colapsado */}
            <item.icon className="w-4 h-4 shrink-0" />

            {/* Label - fade com opacity, w-0 quando invisível */}
            <span
              className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0 w-0 overflow-hidden pointer-events-none'}`}
            >
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle - fade com opacity */}
      <div
        className={`px-3 py-2 border-t border-zinc-100 dark:border-zinc-800 transition-opacity duration-200 ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0 pointer-events-none'}`}
      >
        <ThemeToggle />
      </div>

      {/* User Menu */}
      <div className="border-t border-zinc-100 dark:border-zinc-800">
        {/* Logout Menu - fade com opacity */}
        <div
          className={`overflow-hidden transition-all duration-200 ${isExpanded && showLogout ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sair
            </button>
          </div>
        </div>

        {/* User Info Button */}
        <button
          onClick={() => setShowLogout(!showLogout)}
          className="w-full px-3 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
        >
          <div className="flex items-center">
            {/* Avatar - SEMPRE na mesma posição (início do flex) */}
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0 overflow-hidden">
              {settings.avatarUrl ? (
                <img src={settings.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.email ? getUserInitials(user.email) : 'U'
              )}
            </div>

            {/* User info - fade com opacity, ml-3 fixo */}
            <div
              className={`flex-1 min-w-0 ml-3 transition-opacity duration-200 ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0 w-0 overflow-hidden pointer-events-none'}`}
            >
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate whitespace-nowrap">
                {settings.fullName || user?.email || 'User'}
              </p>
              <p className="text-[10px] text-zinc-500 whitespace-nowrap">Free Plan</p>
            </div>

            {/* ChevronUp - fade com opacity */}
            <ChevronUp
              className={`w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 transition-all duration-200 ${showLogout ? '' : 'rotate-180'} ${isExpanded ? 'opacity-100 ml-2' : 'opacity-0 w-0 overflow-hidden pointer-events-none'}`}
            />
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;