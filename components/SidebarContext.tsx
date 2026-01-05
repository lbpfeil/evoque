import React, { createContext, useContext } from 'react';
import { useSidebarCollapse } from '../hooks/useSidebarCollapse';

type SidebarContextType = ReturnType<typeof useSidebarCollapse>;

const SidebarContext = createContext<SidebarContextType | null>(null);

export const SidebarProvider = ({ children }: React.PropsWithChildren) => {
  const sidebarState = useSidebarCollapse();

  return (
    <SidebarContext.Provider value={sidebarState}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within SidebarProvider');
  }
  return context;
};
