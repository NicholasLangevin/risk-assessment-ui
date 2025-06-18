'use client';

import type React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    // This component now fills its parent, which has pt-14.
    // It needs to be h-full of its parent's content area.
    <div className="flex h-full pt-4"> {/* Ensures AppSidebar and SidebarInset can be laid out */}
      <AppSidebar /> {/* Renders fixed sidebar, top-14 relative to viewport */}
      {/* SidebarInset no longer needs pt-14. It should grow and be scrollable. */}
      <SidebarInset className="bg-background flex-grow h-full overflow-y-auto">
        {children}
      </SidebarInset>
    </div>
  );
}
