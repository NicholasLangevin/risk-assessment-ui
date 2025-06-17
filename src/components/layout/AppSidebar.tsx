
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { HomeIcon, LayoutDashboardIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname(); 

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home" isActive={pathname === '/'}>
              <Link href="/">
                <span className={cn(
                  "inline-flex items-center justify-center", 
                  pathname === '/' && 'bg-destructive p-1 rounded-md'
                )}>
                  <HomeIcon className={cn("h-4 w-4", pathname === '/' && "text-destructive-foreground")} />
                </span>
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Quote Dashboard" isActive={pathname === '/quote-dashboard'}>
              <Link href="/quote-dashboard">
                <span className={cn(
                  "inline-flex items-center justify-center", 
                  pathname === '/quote-dashboard' && 'bg-destructive p-1 rounded-md'
                )}>
                  <LayoutDashboardIcon className={cn("h-4 w-4", pathname === '/quote-dashboard' && "text-destructive-foreground")} />
                </span>
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

