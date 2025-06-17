
'use client';

import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { HomeIcon, LayoutDashboardIcon } from 'lucide-react';

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="h-[calc(100vh-3.5rem)] fixed top-14 left-0 z-30">
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home">
              <Link href="/">
                <HomeIcon />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Quote Dashboard">
              <Link href="/quote-dashboard">
                <LayoutDashboardIcon />
                <span>Quote Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Add more navigation items here if needed */}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
