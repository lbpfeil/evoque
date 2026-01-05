import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  variant?: 'desktop' | 'mobile';
}

export const ThemeToggle = ({ variant = 'desktop' }: ThemeToggleProps) => {
  const { theme, effectiveTheme, setTheme } = useTheme();

  const handleToggle = async () => {
    // Cycle: system → light → dark → system
    const cycle: Record<string, 'light' | 'dark' | 'system'> = {
      system: 'light',
      light: 'dark',
      dark: 'system'
    };
    await setTheme(cycle[theme]);
  };

  // Determine which icon to show
  const Icon = theme === 'system'
    ? Monitor
    : effectiveTheme === 'dark'
      ? Moon
      : Sun;

  // Get tooltip text
  const getTooltipText = () => {
    if (theme === 'system') return 'Tema: Sistema';
    if (theme === 'light') return 'Tema: Claro';
    return 'Tema: Escuro';
  };

  return (
    <button
      onClick={handleToggle}
      className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
      title={getTooltipText()}
      aria-label={getTooltipText()}
    >
      <Icon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
    </button>
  );
};
