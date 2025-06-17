
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter, // Added SidebarFooter
} from '@/components/ui/sidebar';
import { HomeIcon, LayoutDashboardIcon, UserCircle, FolderKanban } from 'lucide-react'; // Added FolderKanban
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
                <span className={cn("inline-flex items-center justify-center")}>
                  <HomeIcon className="h-4 w-4" />
                </span>
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Quote Dashboard" isActive={pathname === '/quote-dashboard'}>
              <Link href="/quote-dashboard">
                <span className={cn("inline-flex items-center justify-center")}>
                  <LayoutDashboardIcon className="h-4 w-4" />
                </span>
                <span>Quote Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Cases" isActive={pathname === '/cases'}>
              <Link href="/cases">
                <span className={cn("inline-flex items-center justify-center")}>
                  <FolderKanban className="h-4 w-4" />
                </span>
                <span>Cases</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Add more navigation items here if needed */}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="User Profile">
              {/* In a real app, this might link to /profile or open a user menu popover */}
              <Link href="#"> 
                <span className={cn("inline-flex items-center justify-center")}>
                  <UserCircle className="h-4 w-4" />
                </span>
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
