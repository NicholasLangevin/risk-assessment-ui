'use client'; // Ensures context can flow from SidebarProvider in RootLayout

import type React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // AppSidebar is fixed and handles its own positioning (top-14).
  // SidebarInset needs padding-top to account for the fixed header and should grow.
  return (
    <>
      <AppSidebar />
      <SidebarInset className="pt-14 bg-background flex-grow">
        {children}
      </SidebarInset>
    </>
  );
}
