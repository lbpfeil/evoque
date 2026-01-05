import { useEffect, useState } from 'react';
import { useStore } from '../components/StoreContext';

export const useTheme = () => {
  const { settings, updateSettings } = useStore();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate effective theme (respects 'system' mode)
  const effectiveTheme = settings.theme === 'system'
    ? systemTheme
    : settings.theme || 'light';

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Sync to localStorage for PWA offline support
    localStorage.setItem('effectiveTheme', effectiveTheme);
  }, [effectiveTheme]);

  // Restore theme from localStorage on mount (PWA offline support)
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (stored && !settings.theme) {
      setTheme(stored);
    }
  }, []);

  // Sync theme to localStorage when it changes
  useEffect(() => {
    if (settings.theme) {
      localStorage.setItem('theme', settings.theme);
    }
  }, [settings.theme]);

  const setTheme = async (theme: 'light' | 'dark' | 'system') => {
    await updateSettings({ theme });
  };

  return {
    theme: settings.theme || 'system',
    effectiveTheme,
    setTheme,
  };
};
