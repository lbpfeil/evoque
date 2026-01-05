import { useState, useEffect, useRef } from 'react';

interface UseSidebarCollapseReturn {
  collapsed: boolean;
  isHovered: boolean;
  isExpanded: boolean;
  toggleCollapsed: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export const useSidebarCollapse = (): UseSidebarCollapseReturn => {
  // Initialize collapsed state from localStorage (default: true)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('evoque_sidebar_collapsed');
    return saved ? JSON.parse(saved) === true : true;
  });

  // Hover state for temporary expansion
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Persist collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('evoque_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Computed expanded state
  const isExpanded = isHovered || !collapsed;

  // Toggle manual collapsed state
  const toggleCollapsed = () => {
    setCollapsed(prev => !prev);
  };

  // Mouse enter handler - immediate expansion
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  // Mouse leave handler - immediate collapse
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  return {
    collapsed,
    isHovered,
    isExpanded,
    toggleCollapsed,
    handleMouseEnter,
    handleMouseLeave,
  };
};
