import React from 'react';
import { NavLink } from 'react-router-dom';
import { Target, Highlighter, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const { t } = useTranslation('common');

  const navItems = [
    { name: t('nav.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { name: t('nav.study'), icon: Target, path: '/study' },
    { name: t('nav.highlights'), icon: Highlighter, path: '/highlights' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around items-center h-20 py-sm md:hidden z-50 safe-area-inset-bottom">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 px-sm py-1.5 min-w-[64px] ${
              isActive ? 'text-foreground' : 'text-muted-foreground'
            }`
          }
        >
          <item.icon className="w-5 h-5" />
          <span className="text-caption font-medium">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
