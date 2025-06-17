
import type React from 'react';
import Link from 'next/link';
import {
  Sidebar,
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
      <div className="flex flex-1"> {/* This div helps manage the layout below the global Header */}
        <Sidebar collapsible="icon" className="h-[calc(100vh-3.5rem)] fixed top-14 left-0 z-30"> {/* Adjust height and position if Header is 3.5rem (h-14) */}
          {/* SidebarHeader removed */}
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
  );
}
