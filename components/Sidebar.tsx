import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Target, Settings, Highlighter, LogOut, ChevronUp, ChevronLeft, LayoutDashboard, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';
import { useSidebarContext } from './SidebarContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { Dashboard, Highlights, Study, Settings as SettingsPage } from '../pages/lazyPages';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

// Fixed icon slot width - matches collapsed sidebar content area
// Collapsed: w-14 (56px) - px-xs*2 (16px) = 40px
const ICON_SLOT = "w-10 flex items-center justify-center shrink-0";

// Footer height: ThemeToggle (48px) + User (64px) + borders (2px) = 114px
const FOOTER_HEIGHT = 114;

const Sidebar = () => {
  const { t } = useTranslation('common');
  const { user, signOut } = useAuth();
  const { settings } = useStore();
  const { isExpanded, toggleCollapsed, handleMouseEnter, handleMouseLeave } = useSidebarContext();
  const isOnline = useOnlineStatus();
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
    { name: t('nav.dashboard'), icon: LayoutDashboard, path: '/dashboard', component: Dashboard },
    { name: t('nav.study'), icon: Target, path: '/study', component: Study },
    { name: t('nav.highlights'), icon: Highlighter, path: '/highlights', component: Highlights },
    { name: t('nav.settings'), icon: Settings, path: '/settings', component: SettingsPage },
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
      {/* Header - fixed height */}
      <div className="h-14 flex items-center px-xs border-b border-sidebar-border shrink-0">
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

      {/* Offline indicator — only visible when offline */}
      {!isOnline && (
        <div className="flex items-center gap-xs px-xs py-1">
          <div className={ICON_SLOT}>
            <WifiOff className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span
            className={cn(
              "text-caption text-amber-500 whitespace-nowrap transition-opacity duration-300",
              isExpanded ? "opacity-100" : "opacity-0"
            )}
          >
            Offline
          </span>
        </div>
      )}

      {/* Navigation - fills remaining space above footer */}
      <nav
        className="flex-1 py-lg px-xs space-y-0.5 overflow-y-auto"
        style={{ paddingBottom: FOOTER_HEIGHT }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onMouseEnter={() => item.component?.preload()}
            className={({ isActive }) =>
              cn(
                "h-10 flex items-center rounded-md text-body font-medium transition-colors duration-200",
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

      {/* Footer - absolutely positioned at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-sidebar"
        style={{ height: FOOTER_HEIGHT }}
      >
        {/* Theme Toggle - fixed height */}
        <div className="h-12 px-xs flex items-center border-t border-sidebar-border">
          <div
            className={cn(
              "pl-1 transition-opacity duration-300",
              isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <ThemeToggle />
          </div>
        </div>

        {/* User Menu */}
        <div className="border-t border-sidebar-border">
          {/* Logout Menu - only visible when expanded and open */}
          <div
            className={cn(
              "absolute bottom-full left-0 right-0 bg-sidebar overflow-hidden transition-all duration-300",
              isExpanded && showLogout ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="px-xs py-sm border-y border-sidebar-border flex items-center">
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

          {/* User Info Button - fixed height */}
          <button
            onClick={() => isExpanded && setShowLogout(!showLogout)}
            className="w-full h-16 flex items-center px-xs hover:bg-sidebar-accent/50 transition-colors"
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
      </div>
    </aside>
  );
};

export default Sidebar;
