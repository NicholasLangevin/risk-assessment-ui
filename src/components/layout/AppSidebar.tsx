
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { HomeIcon, LayoutDashboardIcon } from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname(); // Get the current path

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home" isActive={pathname === '/'}>
              <Link href="/">
                <HomeIcon className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Quote Dashboard" isActive={pathname === '/quote-dashboard'}>
              <Link href="/quote-dashboard">
                <LayoutDashboardIcon className="h-4 w-4" />
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

