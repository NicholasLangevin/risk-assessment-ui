'use client';

import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar'; // This will be the refactored, pure provider
import { Header } from './Header';
import { AppLayout } from './AppLayout';

interface MainLayoutClientProps {
  children: ReactNode;
}

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";

export function MainLayoutClient({ children }: MainLayoutClientProps) {
  return (
    // This div now handles the styling previously in SidebarProvider's internal div
    <div
      className="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar"
      style={
        {
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        } as React.CSSProperties
      }
    >
      <SidebarProvider defaultOpen={true}>
        <Header />
        <AppLayout>
          {children}
        </AppLayout>
      </SidebarProvider>
    </div>
  );
}
