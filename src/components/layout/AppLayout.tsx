
import type React from 'react';
import Link from 'next/link';
import {
  // SidebarProvider, // Removed from here
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { HomeIcon, LayoutDashboard as LayoutDashboardIcon } from 'lucide-react'; 

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    // SidebarProvider removed from here
      <div className="flex flex-1"> {/* This div helps manage the layout below the global Header */}
        <Sidebar collapsible="icon" className="h-[calc(100vh-3.5rem)] fixed top-14 left-0 z-30"> {/* Adjust height and position if Header is 3.5rem (h-14) */}
          <SidebarHeader className="p-4 flex items-center group-data-[state=expanded]:justify-start group-data-[state=collapsed]:justify-center">
            {/* Content for the sidebar's own header, e.g., logo or title when expanded */}
             <span className="font-bold group-data-[state=expanded]:inline-block group-data-[state=collapsed]:hidden">RiskPilot</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <HomeIcon />
                    Home
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/quote-dashboard">
                    <LayoutDashboardIcon />
                    Quote Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="pt-14"> {/* Add padding top to account for fixed Header height */}
          <main className="flex-1 bg-background"> 
            {children}
          </main>
        </SidebarInset>
      </div>
    // SidebarProvider removed from here
  );
}
