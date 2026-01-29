import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Target, Settings, BookOpen, Highlighter, LogOut, ChevronUp, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';
import { useSidebarContext } from './SidebarContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';

const Sidebar = () => {
  const { t } = useTranslation('common');
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
    { name: t('nav.study'), icon: Target, path: '/study' },
    { name: t('nav.highlights'), icon: Highlighter, path: '/highlights' },
    { name: t('nav.settings'), icon: Settings, path: '/settings' },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 ${isExpanded ? 'w-56' : 'w-14'} bg-sidebar border-r border-sidebar-border text-sidebar-foreground hidden md:flex flex-col z-50 transition-[width] duration-300 ease-in-out overflow-hidden`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center h-14 border-b border-sidebar-border relative">
        {/* Logo - SEMPRE na mesma posição (ml-3 fixo) */}
        <div className="p-xs bg-black dark:bg-white text-white dark:text-black rounded-md ml-sm shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>

        {/* Texto - fade com opacity, w-0 quando invisível */}
        <span
          className={`font-bold text-base tracking-tight ml-sm whitespace-nowrap transition-opacity duration-200 ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0 w-0 overflow-hidden pointer-events-none'}`}
        >
          Kindle Mgr.
        </span>

        {/* Spacer para empurrar toggle button para direita */}
        <div className="flex-1" />

        {/* Toggle Button - fade quando collapsed */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className={`p-xs mr-sm transition-opacity duration-200 shrink-0 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-label={isExpanded ? t('sidebar.collapse') : t('sidebar.expand')}
          title={isExpanded ? t('sidebar.collapse') : t('sidebar.expand')}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </div>

      <nav className="flex-1 py-lg px-sm space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center pl-sm pr-sm py-sm rounded-md text-body font-medium transition-colors duration-200 ${isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
              }`
            }
          >
            {/* Ícone - SEMPRE na mesma posição, centralizado quando colapsado */}
            <item.icon className="w-4 h-4 shrink-0" />

            {/* Label - fade com opacity, w-0 quando invisível */}
            <span
              className={`ml-sm whitespace-nowrap transition-opacity duration-200 ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0 w-0 overflow-hidden pointer-events-none'}`}
            >
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle - fade com opacity */}
      <div
        className={`px-sm py-sm border-t border-sidebar-border transition-opacity duration-200 ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0 pointer-events-none'}`}
      >
        <ThemeToggle />
      </div>

      {/* User Menu */}
      <div className="border-t border-sidebar-border">
        {/* Logout Menu - fade com opacity */}
        <div
          className={`overflow-hidden transition-all duration-200 ${isExpanded && showLogout ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="p-sm border-b border-sidebar-border">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-sm px-sm py-sm text-caption text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-3 h-3" />
              {t('sidebar.logout')}
            </Button>
          </div>
        </div>

        {/* User Info Button */}
        <Button
          variant="ghost"
          onClick={() => setShowLogout(!showLogout)}
          className="w-full h-auto px-sm py-md justify-start transition-colors"
        >
          <div className="flex items-center w-full">
            {/* Avatar - SEMPRE na mesma posição (início do flex) */}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-caption shrink-0 overflow-hidden">
              {settings.avatarUrl ? (
                <img src={settings.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.email ? getUserInitials(user.email) : 'U'
              )}
            </div>

            {/* User info - fade com opacity, ml-3 fixo */}
            <div
              className={`flex-1 min-w-0 ml-sm transition-opacity duration-200 ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0 w-0 overflow-hidden pointer-events-none'}`}
            >
              <p className="text-caption font-medium text-sidebar-foreground truncate whitespace-nowrap">
                {settings.fullName || user?.email || t('sidebar.defaultUser')}
              </p>
              <p className="text-overline text-muted-foreground whitespace-nowrap">{t('sidebar.freePlan')}</p>
            </div>

            {/* ChevronUp - fade com opacity */}
            <ChevronUp
              className={`w-3.5 h-3.5 text-muted-foreground transition-all duration-200 ${showLogout ? '' : 'rotate-180'} ${isExpanded ? 'opacity-100 ml-sm' : 'opacity-0 w-0 overflow-hidden pointer-events-none'}`}
            />
          </div>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;