import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Target, Settings, Highlighter, LogOut, ChevronUp, ChevronLeft, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';
import { useSidebarContext } from './SidebarContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';

// Fixed icon slot width - matches collapsed sidebar content area
// Collapsed: w-14 (56px) - px-xs*2 (16px) = 40px
const ICON_SLOT = "w-10 flex items-center justify-center shrink-0";

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
    { name: t('nav.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { name: t('nav.study'), icon: Target, path: '/study' },
    { name: t('nav.highlights'), icon: Highlighter, path: '/highlights' },
    { name: t('nav.settings'), icon: Settings, path: '/settings' },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground hidden md:flex flex-col z-50 transition-[width] duration-300 ease-in-out overflow-hidden",
        isExpanded ? "w-56" : "w-14"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="flex items-center h-14 px-xs border-b border-sidebar-border">
        {/* Logo - fixed slot */}
        <div className={ICON_SLOT}>
          <img
            src="/favicon-evq/favicon-96x96.png"
            alt="Revision"
            className="w-7 h-7"
          />
        </div>

        {/* App Name + Toggle - fade in/out */}
        <div
          className={cn(
            "flex items-center flex-1 min-w-0 transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <span className="font-bold text-base tracking-tight whitespace-nowrap">
            Revision
          </span>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="p-xs shrink-0"
            aria-label={t('sidebar.collapse')}
            title={t('sidebar.collapse')}
          >
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-lg px-xs space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center py-sm rounded-md text-body font-medium transition-colors duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              )
            }
          >
            {/* Icon - fixed slot */}
            <div className={ICON_SLOT}>
              <item.icon className="w-4 h-4" />
            </div>

            {/* Label - fade in/out */}
            <span
              className={cn(
                "whitespace-nowrap transition-opacity duration-300",
                isExpanded ? "opacity-100" : "opacity-0"
              )}
            >
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle - only visible when expanded */}
      <div
        className={cn(
          "px-xs border-t border-sidebar-border overflow-hidden transition-all duration-300",
          isExpanded ? "py-sm opacity-100 max-h-20" : "py-0 opacity-0 max-h-0"
        )}
      >
        <div className="pl-1">
          <ThemeToggle />
        </div>
      </div>

      {/* User Menu */}
      <div className="border-t border-sidebar-border">
        {/* Logout Menu - only visible when expanded and open */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            isExpanded && showLogout ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-xs py-sm border-b border-sidebar-border">
            <div className={ICON_SLOT}>
              {/* Empty slot for alignment */}
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex-1 justify-start gap-sm px-sm py-sm text-caption text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-3 h-3" />
              {t('sidebar.logout')}
            </Button>
          </div>
        </div>

        {/* User Info Button */}
        <button
          onClick={() => isExpanded && setShowLogout(!showLogout)}
          className="w-full flex items-center py-md px-xs hover:bg-sidebar-accent/50 transition-colors"
        >
          {/* Avatar - fixed slot */}
          <div className={ICON_SLOT}>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-caption shrink-0 overflow-hidden">
              {settings.avatarUrl ? (
                <img src={settings.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.email ? getUserInitials(user.email) : 'U'
              )}
            </div>
          </div>

          {/* User info - fade in/out */}
          <div
            className={cn(
              "flex items-center flex-1 min-w-0 transition-opacity duration-300",
              isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="flex-1 min-w-0 text-left">
              <p className="text-caption font-medium text-sidebar-foreground truncate">
                {settings.fullName || user?.email || t('sidebar.defaultUser')}
              </p>
              <p className="text-overline text-muted-foreground">{t('sidebar.freePlan')}</p>
            </div>
            <ChevronUp
              className={cn(
                "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ml-sm",
                showLogout ? "" : "rotate-180"
              )}
            />
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
